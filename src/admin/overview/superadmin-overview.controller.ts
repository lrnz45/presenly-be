import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { SupabaseService } from '../../supabase/supabase.service';

@ApiTags('superadmin-overview')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'admin/overview', version: '1' })
export class SuperadminOverviewController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Platform aggregates' })
  async getStats() {
    const client = this.supabase.getClient();
    
    // 1. Total Instansi
    const { count: instCount } = await client.from('institutions').select('*', { count: 'exact', head: true });
    
    // 2. Total User (Pegawai)
    const { count: empCount } = await client.from('employees').select('*', { count: 'exact', head: true });
    
    // 3. Pendapatan (Total Approved Payments)
    const { data: payData } = await client
      .from('payments')
      .select('amount')
      .eq('verification_status', 'approved');
    const totalRevenue = (payData || []).reduce((acc, p) => acc + Number(p.amount), 0);
    const revenueDisplay = totalRevenue >= 1000000 
      ? `Rp ${(totalRevenue / 1000000).toFixed(1)}jt` 
      : `Rp ${(totalRevenue / 1000).toFixed(0)}rb`;

    // 4. Scan Hari Ini
    const today = new Date().toISOString().split('T')[0];
    const { count: scanToday } = await client
      .from('attendance_logs')
      .select('*', { count: 'exact', head: true })
      .gte('scanned_at', today + ' 00:00:00');

    return [
      { label: 'Instansi Aktif', value: (instCount || 0).toString(), bg: 'bg-blue-50 border-blue-100/50 text-blue-600', icon: 'building' },
      { label: 'Pendapatan', value: revenueDisplay, bg: 'bg-emerald-50 border-emerald-100/50 text-emerald-600', icon: 'money' },
      { label: 'Pindaian Hari Ini', value: (scanToday || 0).toLocaleString('id-ID'), bg: 'bg-amber-50 border-amber-100/50 text-amber-600', icon: 'scan' },
      { label: 'Total User', value: (empCount || 0).toLocaleString('id-ID'), bg: 'bg-purple-50 border-purple-100/50 text-purple-600', icon: 'users' },
    ];
  }

  @Get('scan-chart')
  @ApiOperation({ summary: 'Scan analytics with dynamic range' })
  async getScanChart(@Query('range') range: string = '7d') {
    const client = this.supabase.getClient();
    const days = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
    const result: any[] = [];
    
    // Parse duration (e.g. "20d" -> 20)
    let countDays = parseInt(range) || 7;
    if (countDays > 100) countDays = 100; // Safety cap

    // Fetch data for the specified range
    for (let i = countDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Label based on range scale
      let dayLabel = days[d.getDay()];
      if (countDays > 14) {
        dayLabel = d.getDate().toString(); // Just the day number for long ranges
      }
      
      const { count } = await client
        .from('attendance_logs')
        .select('*', { count: 'exact', head: true })
        .gte('scanned_at', dateStr + ' 00:00:00')
        .lt('scanned_at', dateStr + ' 23:59:59');

      result.push({
        label: dayLabel,
        val: count || 0,
        height: '0%' 
      });
    }

    // Relative height calculation
    const maxVal = Math.max(...result.map(r => Number(r.val)), 1);
    return result.map(r => ({
      ...r,
      height: `${Math.max((Number(r.val) / maxVal) * 90, 5)}%`,
      highlight: Number(r.val) === maxVal && maxVal > 0
    }));
  }

  @Get('recent-institutions')
  @ApiOperation({ summary: 'Newest tenants' })
  async getRecent(@Query('limit') limit: number = 4) {
    const client = this.supabase.getClient();
    
    const { data: insts } = await client
      .from('institutions')
      .select(`
        id, 
        name, 
        plan, 
        initials,
        employees (id)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    return (insts || []).map(inst => ({
      id: inst.id,
      name: inst.name,
      plan: (inst.plan || 'free').toUpperCase(),
      initials: (inst.initials || inst.name.substring(0, 2)).toUpperCase(),
      memberCount: (inst.employees as any[])?.length || 0
    }));
  }
}
