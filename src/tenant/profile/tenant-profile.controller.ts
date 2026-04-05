import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('tenant-profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'tenant/profile', version: '1' })
export class TenantProfileController {
  @Get()
  @ApiOperation({ summary: 'Informasi dasar admin' })
  async getProfile(@Request() req: any) {
    // Stub matching TenantAdminProfile
    return {
      displayName: 'Admin Instansi',
      accountRoleLabel: 'Tenant Admin',
      email: req.user.email,
      phoneNumber: '08123456789',
      avatarUrl: null,
    };
  }

  @Patch()
  @ApiOperation({ summary: 'Simpan profil admin' })
  async updateProfile(@Request() req: any, @Body() dto: any) {
    return { success: true, message: 'Profil diperbarui' };
  }

  @Patch('password')
  @ApiOperation({ summary: 'Ganti kata sandi' })
  async updatePassword(@Request() req: any, @Body() dto: any) {
    return { success: true, message: 'Kata sandi berhasil diubah' };
  }
}
