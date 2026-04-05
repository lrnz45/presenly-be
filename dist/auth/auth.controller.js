"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const google_auth_dto_1 = require("./dto/google-auth.dto");
const auth_response_dto_1 = require("./dto/auth-response.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(dto) {
        return this.authService.register(dto);
    }
    async login(dto) {
        return this.authService.login(dto);
    }
    async google(dto) {
        return this.authService.googleAuth(dto);
    }
    async logout() {
        await this.authService.logout();
        return { message: 'Logged out successfully' };
    }
    async forgotPassword(email) {
        await this.authService.forgotPassword(email);
        return { message: 'Email pemulihan terkirim (jika terdaftar).' };
    }
    async resetPassword(dto) {
        await this.authService.resetPassword(dto);
        return { message: 'Kata sandi berhasil diatur ulang.' };
    }
    async me(req) {
        const adminId = Number(req.user.id || req.user.sub);
        return this.authService.getMe(adminId);
    }
    async updateProfile(req, dto) {
        const adminId = Number(req.user.id || req.user.sub);
        return this.authService.updateProfile(adminId, dto);
    }
    async changePassword(req, dto) {
        const adminId = Number(req.user.id || req.user.sub);
        await this.authService.changePassword(adminId, dto);
        return { success: true };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({
        operationId: 'auth_01_register',
        summary: 'Daftar instansi + admin instansi',
        description: 'Membuat baris `institutions` dan `admins` (role admin). Selaras RegisterInstitutionPayload.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'JWT akses + profil ringkas',
        schema: { $ref: (0, swagger_1.getSchemaPath)(auth_response_dto_1.AuthTokensDto) },
    }),
    (0, swagger_1.ApiConflictResponse)({ description: 'Email / unik bentrok' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Validasi gagal' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({
        operationId: 'auth_02_login',
        summary: 'Login email/password atau googleId',
        description: 'Kirim `email` + `password`, atau hanya `googleId` jika akun sudah ditautkan ke Google.',
    }),
    (0, swagger_1.ApiOkResponse)({
        schema: { $ref: (0, swagger_1.getSchemaPath)(auth_response_dto_1.AuthTokensDto) },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Kredensial salah / akun tidak ada' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('google'),
    (0, swagger_1.ApiOperation)({
        operationId: 'auth_03_google',
        summary: 'Tukar Google ID token → JWT aplikasi',
        description: 'Verifikasi `idToken` (Google Sign-In). Jika admin dengan email/token belum ada, gunakan POST /auth/register dulu.',
    }),
    (0, swagger_1.ApiOkResponse)({
        schema: { $ref: (0, swagger_1.getSchemaPath)(auth_response_dto_1.AuthTokensDto) },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Token Google tidak valid / belum terdaftar',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [google_auth_dto_1.GoogleAuthDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "google", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiOperation)({ summary: 'Logout sesi' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Minta reset kata sandi' }),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset kata sandi dengan token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Profil admin sedang login' }),
    (0, swagger_1.ApiOkResponse)({ schema: { $ref: (0, swagger_1.getSchemaPath)(auth_response_dto_1.AuthUserDto) } }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('update-profile'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Perbarui data profil' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('change-password'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Ganti kata sandi' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, swagger_1.ApiExtraModels)(auth_response_dto_1.AuthTokensDto, auth_response_dto_1.AuthUserDto),
    (0, common_1.Controller)({ path: 'auth', version: '1' }),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map