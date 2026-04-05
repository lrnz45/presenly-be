import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { GoogleAuthDto } from './dto/google-auth.dto';
import type { AuthTokensDto, AuthUserDto } from './dto/auth-response.dto';
export declare class AuthService {
    private readonly supabaseService;
    private readonly jwtService;
    private readonly configService;
    private readonly bcryptRounds;
    constructor(supabaseService: SupabaseService, jwtService: JwtService, configService: ConfigService);
    private initialsFromName;
    private buildUserDto;
    private signTokens;
    register(dto: RegisterDto): Promise<AuthTokensDto>;
    login(dto: LoginDto): Promise<AuthTokensDto>;
    googleAuth(dto: GoogleAuthDto): Promise<AuthTokensDto>;
    getMe(adminId: number): Promise<AuthUserDto>;
    logout(): Promise<void>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(dto: any): Promise<void>;
    updateProfile(adminId: number, dto: any): Promise<AuthUserDto>;
    changePassword(adminId: number, dto: any): Promise<void>;
}
