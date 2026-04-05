import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { AuthTokensDto, AuthUserDto } from './dto/auth-response.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<AuthTokensDto>;
    login(dto: LoginDto): Promise<AuthTokensDto>;
    google(dto: GoogleAuthDto): Promise<AuthTokensDto>;
    logout(): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(dto: any): Promise<{
        message: string;
    }>;
    me(req: any): Promise<AuthUserDto>;
    updateProfile(req: any, dto: any): Promise<AuthUserDto>;
    changePassword(req: any, dto: any): Promise<{
        success: boolean;
    }>;
}
