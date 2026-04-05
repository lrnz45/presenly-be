import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { SupabaseService } from '../../supabase/supabase.service';

@ApiTags('superadmin-institutions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'admin/institutions', version: '1' })
export class SuperadminInstitutionsController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar instansi (seluruh sistem)' })
  async getAll(@Query() query: any) {
    const client = this.supabase.getClient();
    
    const { data: insts } = await client
      .from('institutions')
      .select(`
        *,
        employees (id)
      `)
      .order('created_at', { ascending: false });

    return (insts || []).map(inst => ({
      id: inst.id,
      name: inst.name,
      categoryLabel: (inst.category || 'Lainnya').charAt(0).toUpperCase() + inst.category.slice(1),
      plan: (inst.plan || 'free').toUpperCase(),
      memberCount: (inst.employees as any[])?.length || 0,
      maxEmployees: inst.max_employees || 0,
      expiresAt: inst.expires_at,
      subscriptionHealth: new Date(inst.expires_at) > new Date() ? 'active' : 'expired',
      initials: inst.initials || inst.name.substring(0, 2).toUpperCase()
    }));
  }

  @Post()
  @ApiOperation({ summary: 'Tambah instansi baru' })
  async create(@Body() dto: any) {
    const client = this.supabase.getClient();
    
    // Mapping dari frontend draft ke database columns
    const insertData = {
      name: dto.institutionName,
      category: dto.category,
      plan: dto.plan,
      contact_email: dto.primaryAdminEmail,
      phone: dto.whatsappNumber,
      initials: dto.institutionName.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase(),
      
      // Default Values
      check_in_time: '07:30:00',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 hari
    };

    const { data, error } = await client
      .from('institutions')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail instansi' })
  async getOne(@Param('id') id: string) {
    const client = this.supabase.getClient();
    const { data } = await client
      .from('institutions')
      .select('*, employees(id)')
      .eq('id', id)
      .single();
    
    return data;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit / Suspend instansi' })
  async update(@Param('id') id: string, @Body() dto: any) {
    const client = this.supabase.getClient();
    const { error } = await client.from('institutions').update(dto).eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Data diperbarui' };
  }

  @Get(':id/employees')
  @ApiOperation({ summary: 'Daftar anggota instansi tersebut' })
  async getEmployees(@Param('id') id: string, @Query() query: any) {
    return [{ id: 1, name: 'Budi Santoso' }];
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Riwayat tagihan instansi tersebut' })
  async getPayments(@Param('id') id: string, @Query() query: any) {
    return [{ id: 1, amount: 149000, date: '2026-04-01Z' }];
  }
}
