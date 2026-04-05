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
exports.SuperadminProfileController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let SuperadminProfileController = class SuperadminProfileController {
    async getProfile(req) {
        return {
            displayName: 'Super Admin Root',
            email: req.user.email,
            phoneNumber: '081200011122',
            avatarUrl: null,
        };
    }
    async updateProfile(req, dto) {
        return { success: true, message: 'Profil diperbarui' };
    }
    async updatePassword(req, dto) {
        return { success: true, message: 'Kata sandi root berhasil diubah' };
    }
};
exports.SuperadminProfileController = SuperadminProfileController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Data profil superadmin' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperadminProfileController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)(),
    (0, swagger_1.ApiOperation)({ summary: 'Simpan profil superadmin' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SuperadminProfileController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)('password'),
    (0, swagger_1.ApiOperation)({ summary: 'Ganti kata sandi superadmin' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SuperadminProfileController.prototype, "updatePassword", null);
exports.SuperadminProfileController = SuperadminProfileController = __decorate([
    (0, swagger_1.ApiTags)('superadmin-profile'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)({ path: 'admin/profile', version: '1' })
], SuperadminProfileController);
//# sourceMappingURL=superadmin-profile.controller.js.map