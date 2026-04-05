import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { AuthTokensDto, AuthUserDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@ApiExtraModels(AuthTokensDto, AuthUserDto)
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    operationId: 'auth_01_register',
    summary: 'Daftar instansi + admin instansi',
    description:
      'Membuat baris `institutions` dan `admins` (role admin). Selaras RegisterInstitutionPayload.',
  })
  @ApiOkResponse({
    description: 'JWT akses + profil ringkas',
    schema: { $ref: getSchemaPath(AuthTokensDto) },
  })
  @ApiConflictResponse({ description: 'Email / unik bentrok' })
  @ApiBadRequestResponse({ description: 'Validasi gagal' })
  async register(@Body() dto: RegisterDto): Promise<AuthTokensDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({
    operationId: 'auth_02_login',
    summary: 'Login email/password atau googleId',
    description:
      'Kirim `email` + `password`, atau hanya `googleId` jika akun sudah ditautkan ke Google.',
  })
  @ApiOkResponse({
    schema: { $ref: getSchemaPath(AuthTokensDto) },
  })
  @ApiUnauthorizedResponse({ description: 'Kredensial salah / akun tidak ada' })
  async login(@Body() dto: LoginDto): Promise<AuthTokensDto> {
    return this.authService.login(dto);
  }

  @Post('google')
  @ApiOperation({
    operationId: 'auth_03_google',
    summary: 'Tukar Google ID token → JWT aplikasi',
    description:
      'Verifikasi `idToken` (Google Sign-In). Jika admin dengan email/token belum ada, gunakan POST /auth/register dulu.',
  })
  @ApiOkResponse({
    schema: { $ref: getSchemaPath(AuthTokensDto) },
  })
  @ApiUnauthorizedResponse({
    description: 'Token Google tidak valid / belum terdaftar',
  })
  async google(@Body() dto: GoogleAuthDto): Promise<AuthTokensDto> {
    return this.authService.googleAuth(dto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout sesi' })
  async logout(): Promise<{ message: string }> {
    await this.authService.logout();
    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Minta reset kata sandi' })
  async forgotPassword(
    @Body('email') email: string,
  ): Promise<{ message: string }> {
    await this.authService.forgotPassword(email);
    return { message: 'Email pemulihan terkirim (jika terdaftar).' };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset kata sandi dengan token' })
  async resetPassword(@Body() dto: any): Promise<{ message: string }> {
    await this.authService.resetPassword(dto);
    return { message: 'Kata sandi berhasil diatur ulang.' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profil admin sedang login' })
  @ApiOkResponse({ schema: { $ref: getSchemaPath(AuthUserDto) } })
  async me(@Request() req: any): Promise<AuthUserDto> {
    // Ambil 'id' dari req.user dan pastikan tipenya Number
    const adminId = Number(req.user.id || req.user.sub);
    return this.authService.getMe(adminId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perbarui data profil' })
  async updateProfile(
    @Request() req: any,
    @Body() dto: any,
  ): Promise<AuthUserDto> {
    const adminId = Number(req.user.id || req.user.sub);
    return this.authService.updateProfile(adminId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ganti kata sandi' })
  async changePassword(
    @Request() req: any,
    @Body() dto: any,
  ): Promise<{ success: boolean }> {
    const adminId = Number(req.user.id || req.user.sub);
    await this.authService.changePassword(adminId, dto);
    return { success: true };
  }
}
