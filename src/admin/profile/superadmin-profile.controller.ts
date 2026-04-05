import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('superadmin-profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'admin/profile', version: '1' })
export class SuperadminProfileController {
  @Get()
  @ApiOperation({ summary: 'Data profil superadmin' })
  async getProfile(@Request() req: any) {
    // Stub matching SuperAdminProfile
    return {
      displayName: 'Super Admin Root',
      email: req.user.email,
      phoneNumber: '081200011122',
      avatarUrl: null,
    };
  }

  @Patch()
  @ApiOperation({ summary: 'Simpan profil superadmin' })
  async updateProfile(@Request() req: any, @Body() dto: any) {
    return { success: true, message: 'Profil diperbarui' };
  }

  @Patch('password')
  @ApiOperation({ summary: 'Ganti kata sandi superadmin' })
  async updatePassword(@Request() req: any, @Body() dto: any) {
    return { success: true, message: 'Kata sandi root berhasil diubah' };
  }
}
