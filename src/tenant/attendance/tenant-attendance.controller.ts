import { Controller, Get, Patch, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SupabaseService } from '../../supabase/supabase.service';

@ApiTags('tenant-attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'institutions/me', version: '1' })
export class TenantAttendanceController {
  constructor(private readonly supabaseService: SupabaseService) {}
  @Get('attendance-daily')
  @ApiOperation({ summary: 'Data rekap bulanan (attendance-daily)' })
  async getCalendar(@Request() req: any, @Query() query: any) {
    const supabase = this.supabaseService.getClient();
    const institutionId = req.user.institutionId;

    // Ambil tahun dan bulan dari query (default ke bulan ini jika tidak ada)
    const now = new Date();
    const year = query.year || now.getFullYear();
    const month = query.month || now.getMonth() + 1;
    const monthStr = month.toString().padStart(2, '0');
    const monthKey = `${year}-${monthStr}`;

    // 1. Ambil semua pegawai instansi ini
    const { data: employees, error: empErr } = await supabase
      .from('employees')
      .select('id, name, initials, avatar_color')
      .eq('institution_id', institutionId)
      .eq('is_active', true)
      .order('name');

    if (empErr) {
      console.error('[REKAP] Gagal ambil pegawai:', empErr.message);
      return { employees: [], attendance: {} };
    }

    // 2. Ambil data harian untuk bulan ini
    const startDate = `${monthKey}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${monthKey}-${lastDay}`;
    const employeeIds = (employees || []).map(e => e.id);

    const { data: records, error: recErr } = await supabase
      .from('attendance_daily_records')
      .select('employee_id, record_date, day_code')
      .in('employee_id', employeeIds)
      .gte('record_date', startDate)
      .lte('record_date', endDate);

    if (recErr) {
      console.error('[REKAP] Gagal ambil records:', recErr.message);
      return { employees: employees || [], attendance: {} };
    }

    // 3. Map ke format frontend (empId -> day -> status)
    const attendanceMap = {};
    (records || []).forEach((r) => {
      const empId = r.employee_id;
      if (!attendanceMap[empId]) attendanceMap[empId] = {};

      // Parsing manual untuk menghindari masalah timezone (YYYY-MM-DD)
      const day = parseInt(r.record_date.split('-')[2]);
      attendanceMap[empId][day] = r.day_code;
    });

    return {
      employees: (employees || []).map((e) => ({
        id: e.id,
        name: e.name,
        initials: e.initials,
        avatarColor: e.avatar_color,
      })),
      attendance: attendanceMap,
    };
  }

  @Get('attendance-logs')
  @ApiOperation({ summary: 'Daftar riwayat mentah (attendance-logs)' })
  async getLogs(@Query() query: any) {
    const supabase = this.supabaseService.getClient();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('attendance_logs')
      .select(`
        id,
        scanned_at,
        scan_type,
        employee_id,
        employees (
          name,
          job_title,
          department,
          photo_url
        )
      `)
      .gt('scanned_at', todayStart.toISOString())
      .order('scanned_at', { ascending: false })
      .limit(20);

    if (error) return [];

    return (data || []).map((log: any) => ({
      id: log.id,
      staffName: log.employees?.name || 'Unknown',
      subtitle: log.employees?.job_title || log.employees?.department || 'Staff',
      photoUrl: log.employees?.photo_url,
      checkInDisplay: new Date(log.scanned_at).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'H',
      scanType: log.scan_type,
    }));
  }

  @Get('attendance-daily/:id')
  @ApiOperation({ summary: 'Detail edit satu rekor' })
  async getDailyRecord(@Param('id') id: string) {
    return { id, dayCode: 'H', checkInTime: '07:54' };
  }

  @Patch('attendance-daily/:id')
  @ApiOperation({ summary: 'Update rekor absensi' })
  async updateDailyRecord(@Param('id') id: string, @Body() dto: any) {
    return { success: true };
  }

  @Put('attendance-daily')
  @ApiOperation({ summary: 'Upsert satu sel rekap' })
  async upsertDailyRecord(@Body() dto: any) {
    return { success: true, id: Date.now() };
  }

  @Delete('attendance-daily')
  @ApiOperation({ summary: 'Hapus entri harian' })
  async deleteDailyRecord(@Query('employeeId') employeeId: string, @Query('recordDate') recordDate: string) {
    return { success: true };
  }

  @Get('exports/excel')
  @ApiOperation({ summary: 'Ekspor laporan Excel' })
  async exportExcel(@Query() query: any) {
    return { url: 'https://example.com/export.xlsx' };
  }

  @Get('exports/pdf')
  @ApiOperation({ summary: 'Ekspor laporan PDF' })
  async exportPdf(@Query() query: any) {
    return { url: 'https://example.com/export.pdf' };
  }
}
