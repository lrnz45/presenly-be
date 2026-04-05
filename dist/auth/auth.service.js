"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const google_auth_library_1 = require("google-auth-library");
const supabase_service_1 = require("../supabase/supabase.service");
let AuthService = class AuthService {
    constructor(supabaseService, jwtService, configService) {
        this.supabaseService = supabaseService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.bcryptRounds = 10;
    }
    initialsFromName(name, max) {
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0)
            return '?'.slice(0, max);
        const s = parts.length >= 2
            ? `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
            : parts[0].slice(0, 2).toUpperCase();
        return s.slice(0, max);
    }
    buildUserDto(row) {
        return {
            adminId: row.id,
            email: row.email,
            fullName: row.full_name,
            role: row.role,
            institutionId: row.institution_id,
            googleId: row.google_id,
        };
    }
    async signTokens(row) {
        const payload = {
            sub: String(row.id),
            email: row.email,
            institutionId: row.institution_id,
            role: row.role,
        };
        const accessToken = await this.jwtService.signAsync(payload);
        const expSecRaw = this.configService.get('JWT_EXPIRES_IN', '7d');
        const expiresIn = parseExpiresToSeconds(expSecRaw);
        return {
            accessToken,
            tokenType: 'Bearer',
            expiresIn,
            user: this.buildUserDto(row),
        };
    }
    async register(dto) {
        const supabase = this.supabaseService.getClient();
        const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);
        const expiresAt = new Date(Date.now() + 365 * 86400000).toISOString();
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
            if (instErr.message?.toLowerCase().includes('duplicate') ||
                instErr.code === '23505') {
                throw new common_1.ConflictException('Data institusi bentrok (unik).');
            }
            throw new common_1.InternalServerErrorException(instErr.message);
        }
        const institutionId = inst.id;
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
            if (admErr.message?.toLowerCase().includes('duplicate') ||
                admErr.code === '23505') {
                throw new common_1.ConflictException('Email sudah terdaftar.');
            }
            throw new common_1.InternalServerErrorException(admErr.message);
        }
        return this.signTokens(admin);
    }
    async login(dto) {
        const supabase = this.supabaseService.getClient();
        if (dto.googleId) {
            const { data, error } = await supabase
                .from('admins')
                .select('*')
                .eq('google_id', dto.googleId)
                .maybeSingle();
            if (error) {
                throw new common_1.InternalServerErrorException(error.message);
            }
            if (!data) {
                throw new common_1.UnauthorizedException('Akun Google belum ditautkan.');
            }
            return this.signTokens(data);
        }
        if (!dto.email || !dto.password) {
            throw new common_1.UnauthorizedException('Kirim email dan password, atau googleId.');
        }
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('email', dto.email)
            .maybeSingle();
        if (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
        if (!data || !data.password_hash) {
            throw new common_1.UnauthorizedException('Email atau password salah.');
        }
        const ok = await bcrypt.compare(dto.password, data.password_hash);
        if (!ok) {
            throw new common_1.UnauthorizedException('Email atau password salah.');
        }
        return this.signTokens(data);
    }
    async googleAuth(dto) {
        const clientId = dto.audience ||
            this.configService.get('GOOGLE_CLIENT_ID') ||
            '';
        if (!clientId) {
            throw new common_1.ServiceUnavailableException('GOOGLE_CLIENT_ID belum dikonfigurasi di server.');
        }
        const client = new google_auth_library_1.OAuth2Client(clientId);
        let ticket;
        try {
            ticket = await client.verifyIdToken({
                idToken: dto.idToken,
                audience: clientId,
            });
        }
        catch {
            throw new common_1.UnauthorizedException('ID token Google tidak valid.');
        }
        const payload = ticket.getPayload();
        if (!payload?.sub || !payload.email) {
            throw new common_1.UnauthorizedException('Token Google tidak berisi identitas.');
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
            throw new common_1.InternalServerErrorException(error.message);
        }
        if (!row) {
            const r2 = await supabase
                .from('admins')
                .select('*')
                .eq('email', email)
                .maybeSingle();
            if (r2.error) {
                throw new common_1.InternalServerErrorException(r2.error.message);
            }
            row = r2.data;
            if (row && !row.google_id) {
                await supabase.from('admins').update({ google_id: sub }).eq('id', row.id);
                row = { ...row, google_id: sub };
            }
        }
        if (!row) {
            throw new common_1.UnauthorizedException('Belum terdaftar. Daftar dulu dengan POST /auth/register.');
        }
        return this.signTokens(row);
    }
    async getMe(adminId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('id', adminId)
            .maybeSingle();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        if (!data)
            throw new common_1.UnauthorizedException('Sesi tidak valid.');
        return this.buildUserDto(data);
    }
    async logout() {
        return;
    }
    async forgotPassword(email) {
        return;
    }
    async resetPassword(dto) {
        return;
    }
    async updateProfile(adminId, dto) {
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
            if (error.code === '23505')
                throw new common_1.ConflictException('Email sudah digunakan.');
            throw new common_1.InternalServerErrorException(error.message);
        }
        return this.buildUserDto(data);
    }
    async changePassword(adminId, dto) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('admins')
            .select('password_hash')
            .eq('id', adminId)
            .single();
        if (error || !data || !data.password_hash) {
            throw new common_1.UnauthorizedException('Sesi tidak valid.');
        }
        const ok = await bcrypt.compare(dto.currentPassword, data.password_hash);
        if (!ok) {
            throw new common_1.UnauthorizedException('Kata sandi saat ini salah.');
        }
        const newHash = await bcrypt.hash(dto.newPassword, this.bcryptRounds);
        const { error: updErr } = await supabase
            .from('admins')
            .update({ password_hash: newHash })
            .eq('id', adminId);
        if (updErr)
            throw new common_1.InternalServerErrorException(updErr.message);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
function parseExpiresToSeconds(exp) {
    const m = exp.match(/^(\d+)([smhd])$/i);
    if (!m)
        return 604800;
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
//# sourceMappingURL=auth.service.js.map