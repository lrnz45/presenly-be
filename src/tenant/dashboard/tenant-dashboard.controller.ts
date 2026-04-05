import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SupabaseService } from '../../supabase/supabase.service';

@ApiTags('tenant-dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'tenant/dashboard', version: '1' })
export class TenantDashboardController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Kartu stat, angka agregat' })
  async getSummary(@Request() req: any, @Query('date') date?: string) {
    const client = this.supabase.getClient();
    const instId = req.user.institutionId; 
    const today = date || new Date().toISOString().split('T')[0];

    // Fetch institution settings for late calculation
    const { data: inst } = await client
      .from('institutions')
      .select('check_in_time, late_tolerance_minutes')
      .eq('id', instId)
      .single();

    const checkInTime = inst?.check_in_time || '07:00:00';
    const tolerance = inst?.late_tolerance_minutes || 0;
    
    // Construct the late threshold timestamp (in UTC for simplicity, or local if handled)
    const lateThreshold = `${today}T${checkInTime}Z`; // This is naive, but better for now

    // 1. Hadir 
    const { count: presentCount } = await client
      .from('attendance_logs')
      .select('id, employees!inner(institution_id)', { count: 'exact', head: true })
      .eq('employees.institution_id', instId)
      .gte('scanned_at', `${today}T00:00:00Z`);

    // 2. Terlambat - For now we count based on time if possible, or just mock if too complex for raw SQL join
    // Let's refine: anything scanned after checkIn + tolerance on that day
    // For now we'll do a simple check
    const { count: lateCount } = await client
      .from('attendance_logs')
      .select('id, employees!inner(institution_id)', { count: 'exact', head: true })
      .eq('employees.institution_id', instId)
      .gte('scanned_at', `${today}T${checkInTime}Z`) // This is a rough estimation of late
      .gte('scanned_at', `${today}T00:00:00Z`);

    // 3. Wajah Terdaftar (Total Employees with faces)
    const { count: faceCount } = await client
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('institution_id', instId)
      .not('face_embedding', 'is', null);

    // 4. Pegawai Aktif
    const { count: activeCount } = await client
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('institution_id', instId)
      .eq('status', 'active');

    return [
      { label: 'HADIR HARI INI', value: (presentCount || 0).toLocaleString('id-ID'), iconBgClass: 'bg-blue-50 text-blue-600', icon: 'User' },
      { label: 'TERLAMBAT', value: (lateCount || 0).toLocaleString('id-ID'), iconBgClass: 'bg-amber-50 text-amber-600', icon: 'Clock' },
      { label: 'WAJAH TERDAFTAR', value: (faceCount || 0).toLocaleString('id-ID'), iconBgClass: 'bg-blue-50 text-blue-600', icon: 'ScanFace' },
      { label: 'PEGAWAI AKTIF', value: (activeCount || 0).toLocaleString('id-ID'), iconBgClass: 'bg-slate-50 text-slate-600', icon: 'Users' },
    ];
  }

  @Get('attendance-chart')
  @ApiOperation({ summary: 'Grafik mingguan' })
  async getChart(@Request() req: any, @Query('range') range: string = '7d') {
    const client = this.supabase.getClient();
    const instId = req.user.institutionId;
    const days = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
    const result: any[] = [];
    
    // Parse duration (e.g. "20d" -> 20)
    let countDays = parseInt(range) || 7;
    if (countDays > 100) countDays = 100; // Safety cap

    for (let i = countDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Label based on scale
      let dayLabel = days[d.getDay()];
      if (countDays > 14) {
        dayLabel = d.getDate().toString(); 
      }
      
      const { count } = await client
        .from('attendance_logs')
        .select('id, employees!inner(institution_id)', { count: 'exact', head: true })
        .eq('employees.institution_id', instId)
        .gte('scanned_at', dateStr + 'T00:00:00Z')
        .lt('scanned_at', dateStr + 'T23:59:59Z');

      result.push({
        label: dayLabel,
        val: count || 0,
        height: '0%' 
      });
    }

    const maxVal = Math.max(...result.map(r => Number(r.val)), 1);
    return result.map(r => ({
      ...r,
      height: `${Math.max((Number(r.val) / maxVal) * 90, 5)}%`,
      highlight: Number(r.val) === maxVal && maxVal > 0
    }));
  }

  @Get('live-scans')
  @ApiOperation({ summary: 'Deteksi live' })
  async getLiveScans(@Request() req: any, @Query('limit') limit: number = 20) {
    const client = this.supabase.getClient();
    const instId = req.user.institutionId;

    const { data } = await client
      .from('attendance_logs')
      .select(`
        id,
        scanned_at,
        scan_type,
        confidence,
        employees!inner(full_name, institution_id)
      `)
      .eq('employees.institution_id', instId)
      .order('scanned_at', { ascending: false })
      .limit(limit);

    return (data || []).map(log => ({
      id: log.id,
      name: (log.employees as any)?.full_name || 'Anonymous',
      terminalLabel: 'SCANNER UTAMA',
      timeDisplay: new Date(log.scanned_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      matchLabel: `MIRIP ${(Number(log.confidence) || 0).toFixed(0)}%`,
      presence: 'online' // Dynamic status can be added later
    }));
  }

  @Get('early-arrivals')
  @ApiOperation({ summary: 'Kartu kedatangan pagi' })
  async getEarlyArrivals(@Request() req: any, @Query('limit') limit: number = 5) {
    const client = this.supabase.getClient();
    const instId = req.user.institutionId;
    const now = new Date();
    // Start of day in UTC+7 is yesterday 17:00 UTC
    const localToday = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const todayStr = localToday.toISOString().split('T')[0];
    
    // We fetch from the start of the current local day (UTC-7)
    const { data } = await client
      .from('attendance_logs')
      .select(`
        id,
        scanned_at,
        employees!inner(id, full_name, employee_code, institution_id)
      `)
      .eq('employees.institution_id', instId)
      .gte('scanned_at', `${todayStr}T00:00:00`) 
      .order('scanned_at', { ascending: true })
      .limit(limit);

    return (data || []).map(log => ({
      id: (log.employees as any)?.id,
      fullName: (log.employees as any)?.full_name,
      employeeCode: (log.employees as any)?.employee_code,
      scannedAt: log.scanned_at
    }));
  }
}
