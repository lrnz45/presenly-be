import { Controller, Get, Patch, Body, UseGuards, Request, Post, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('tenant-management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ version: '1' })
export class TenantInstitutionController {
  @Get('tenant/institution')
  @ApiOperation({ summary: 'Data profil + aturan kerja instansi aktif' })
  async getInstitution(@Request() req: any) {
    // Stub matching TenantSettings + TenantDetail
    return {
      institutionName: 'SMA Negeri 1 Jakarta',
      category: 'sekolah',
      address: 'Jl. Utama No.1',
      timezone: 'WIB',
      contactEmail: 'admin@sman1jkt.sch.id',
      phone: '08123456789',
      attendanceMode: 'both',
      checkInTime: '07:00:00',
      checkOutTime: '17:00:00',
      lateToleranceMinutes: 15,
      activeWeekdays: ['sen', 'sel', 'rab', 'kam', 'jum'],
    };
  }

  @Patch('tenant/institution')
  @ApiOperation({ summary: 'Simpan pengaturan instansi' })
  async updateInstitution(@Request() req: any, @Body() dto: any) {
    return { success: true, message: 'Berhasil diperbarui' };
  }

  @Patch('tenant/institution/kiosk-pin')
  @ApiOperation({ summary: 'Ubah PIN kiosk' })
  async updateKioskPin(@Request() req: any, @Body('pin') pin: string) {
    return { success: true, message: 'PIN berhasil diubah' };
  }

  @Get('tenant/admins')
  @ApiOperation({ summary: 'Daftar admin instansi' })
  async getAdmins(@Request() req: any) {
    // Stub matching TenantAdminUser
    return [
      { id: 1, fullName: 'Budi Santoso', email: 'budi@sman1jkt.sch.id', phoneNumber: '081298765432', role: 'admin', initials: 'BS', color: '#3B6BF6', avatarUrl: null },
      { id: 2, fullName: 'Rina Wulandari', email: 'rina@sman1jkt.sch.id', phoneNumber: '081377788899', role: 'admin', initials: 'RW', color: '#f97316', avatarUrl: null },
    ];
  }

  @Post('tenant/admins/invitations')
  @ApiOperation({ summary: 'Undang admin baru' })
  async inviteAdmin(@Request() req: any, @Body('email') email: string) {
    return { success: true, message: 'Undangan terkirim' };
  }

  @Delete('tenant/admins/:adminId')
  @ApiOperation({ summary: 'Hapus akses admin' })
  async removeAdmin(@Request() req: any, @Param('adminId') adminId: string) {
    return { success: true, message: 'Admin dihapus' };
  }
}
