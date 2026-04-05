import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { SupabaseService } from '../supabase/supabase.service';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { GoogleAuthDto } from './dto/google-auth.dto';
import type { AuthTokensDto, AuthUserDto } from './dto/auth-response.dto';

type AdminRow = {
  id: number;
  institution_id: number | null;
  role: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  initials: string | null;
  password_hash: string | null;
  google_id: string | null;
};

@Injectable()
export class AuthService {
  private readonly bcryptRounds = 10;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private initialsFromName(name: string, max: number): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?'.slice(0, max);
    const s =
      parts.length >= 2
        ? `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    return s.slice(0, max);
  }

  private buildUserDto(row: AdminRow): AuthUserDto {
    return {
      adminId: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      institutionId: row.institution_id,
      googleId: row.google_id,
    };
  }

  private async signTokens(row: AdminRow): Promise<AuthTokensDto> {
    const payload = {
      sub: String(row.id),
      email: row.email,
      institutionId: row.institution_id,
      role: row.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    const expSecRaw = this.configService.get<string>('JWT_EXPIRES_IN', '7d');
    const expiresIn = parseExpiresToSeconds(expSecRaw);
    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: this.buildUserDto(row),
    };
  }

  async register(dto: RegisterDto): Promise<AuthTokensDto> {
    const supabase = this.supabaseService.getClient();
    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);

    const expiresAt = new Date(
      Date.now() + 365 * 86400000,
    ).toISOString();

    const instRow = {
      name: dto.institutionName,
      category: dto.category,
      address: null,
      timezone: 'WIB',
      contact_email: dto.email,
      phone: dto.phone,
      initials: this.initialsFromName(dto.institutionName, 10),
      attendance_mode: 'both',
      check_in_time: '07:00:00',
      check_out_time: '17:00:00',
      late_tolerance_minutes: 15,
      active_weekdays: ['sen', 'sel', 'rab', 'kam', 'jum'],
      kiosk_pin: '123456',
      plan: 'free',
      max_employees: 15,
      expires_at: expiresAt,
    };

    const { data: inst, error: instErr } = await supabase
      .from('institutions')
      .insert(instRow)
      .select('id')
      .single();

    if (instErr) {
      if (
        instErr.message?.toLowerCase().includes('duplicate') ||
        instErr.code === '23505'
      ) {
        throw new ConflictException('Data institusi bentrok (unik).');
      }
      throw new InternalServerErrorException(instErr.message);
    }

    const institutionId = inst.id as number;

    const adminRow = {
      institution_id: institutionId,
      role: 'admin',
      full_name: dto.registrantFullName,
      email: dto.email,
      phone_number: dto.phone,
      initials: this.initialsFromName(dto.registrantFullName, 5),
      avatar_color: '#3B6BF6',
      password_hash: passwordHash,
      google_id: null,
    };

    const { data: admin, error: admErr } = await supabase
      .from('admins')
      .insert(adminRow)
      .select('*')
      .single();

    if (admErr) {
      await supabase.from('institutions').delete().eq('id', institutionId);
      if (
        admErr.message?.toLowerCase().includes('duplicate') ||
        admErr.code === '23505'
      ) {
        throw new ConflictException('Email sudah terdaftar.');
      }
      throw new InternalServerErrorException(admErr.message);
    }

    return this.signTokens(admin as AdminRow);
  }

  async login(dto: LoginDto): Promise<AuthTokensDto> {
    const supabase = this.supabaseService.getClient();

    if (dto.googleId) {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('google_id', dto.googleId)
        .maybeSingle();
      if (error) {
        throw new InternalServerErrorException(error.message);
      }
      if (!data) {
        throw new UnauthorizedException('Akun Google belum ditautkan.');
      }
      return this.signTokens(data as AdminRow);
    }

    if (!dto.email || !dto.password) {
      throw new UnauthorizedException(
        'Kirim email dan password, atau googleId.',
      );
    }

    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', dto.email)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!data || !data.password_hash) {
      throw new UnauthorizedException('Email atau password salah.');
    }

    const ok = await bcrypt.compare(dto.password, data.password_hash);
    if (!ok) {
      throw new UnauthorizedException('Email atau password salah.');
    }

    return this.signTokens(data as AdminRow);
  }

  async googleAuth(dto: GoogleAuthDto): Promise<AuthTokensDto> {
    const clientId =
      dto.audience ||
      this.configService.get<string>('GOOGLE_CLIENT_ID') ||
      '';
    if (!clientId) {
      throw new ServiceUnavailableException(
        'GOOGLE_CLIENT_ID belum dikonfigurasi di server.',
      );
    }

    const client = new OAuth2Client(clientId);
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: dto.idToken,
        audience: clientId,
      });
    } catch {
      throw new UnauthorizedException('ID token Google tidak valid.');
    }

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Token Google tidak berisi identitas.');
    }

    const sub = payload.sub;
    const email = payload.email;
    const supabase = this.supabaseService.getClient();

    let { data: row, error } = await supabase
      .from('admins')
      .select('*')
      .eq('google_id', sub)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!row) {
      const r2 = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      if (r2.error) {
        throw new InternalServerErrorException(r2.error.message);
      }
      row = r2.data;
      if (row && !row.google_id) {
        await supabase.from('admins').update({ google_id: sub }).eq('id', row.id);
        row = { ...row, google_id: sub };
      }
    }

    if (!row) {
      throw new UnauthorizedException(
        'Belum terdaftar. Daftar dulu dengan POST /auth/register.',
      );
    }

    return this.signTokens(row as AdminRow);
  }

  async getMe(adminId: number): Promise<AuthUserDto> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', adminId)
      .maybeSingle();
    if (error) throw new InternalServerErrorException(error.message);
    if (!data) throw new UnauthorizedException('Sesi tidak valid.');
    return this.buildUserDto(data as AdminRow);
  }

  async logout(): Promise<void> {
    // Stateless JWT, client is expected to clear the token.
    return;
  }

  async forgotPassword(email: string): Promise<void> {
    // TODO: Send reset email. For now skip as per request "buat semua endpoint tanpa mengubah plan".
    return;
  }

  async resetPassword(dto: any): Promise<void> {
    // TODO: Verify token and update password.
    return;
  }

  async updateProfile(adminId: number, dto: any): Promise<AuthUserDto> {
    const supabase = this.supabaseService.getClient();
    const update = {
      full_name: dto.fullName,
      email: dto.email,
      phone_number: dto.phoneNumber,
    };
    const { data, error } = await supabase
      .from('admins')
      .update(update)
      .eq('id', adminId)
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') throw new ConflictException('Email sudah digunakan.');
      throw new InternalServerErrorException(error.message);
    }
    return this.buildUserDto(data as AdminRow);
  }

  async changePassword(adminId: number, dto: any): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('admins')
      .select('password_hash')
      .eq('id', adminId)
      .single();

    if (error || !data || !data.password_hash) {
      throw new UnauthorizedException('Sesi tidak valid.');
    }

    const ok = await bcrypt.compare(dto.currentPassword, data.password_hash);
    if (!ok) {
      throw new UnauthorizedException('Kata sandi saat ini salah.');
    }

    const newHash = await bcrypt.hash(dto.newPassword, this.bcryptRounds);
    const { error: updErr } = await supabase
      .from('admins')
      .update({ password_hash: newHash })
      .eq('id', adminId);

    if (updErr) throw new InternalServerErrorException(updErr.message);
  }
}

function parseExpiresToSeconds(exp: string): number {
  const m = exp.match(/^(\d+)([smhd])$/i);
  if (!m) return 604800;
  const n = parseInt(m[1], 10);
  const u = m[2].toLowerCase();
  switch (u) {
    case 's':
      return n;
    case 'm':
      return n * 60;
    case 'h':
      return n * 3600;
    case 'd':
      return n * 86400;
    default:
      return 604800;
  }
}
