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
exports.TenantInstitutionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let TenantInstitutionController = class TenantInstitutionController {
    async getInstitution(req) {
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
    async updateInstitution(req, dto) {
        return { success: true, message: 'Berhasil diperbarui' };
    }
    async updateKioskPin(req, pin) {
        return { success: true, message: 'PIN berhasil diubah' };
    }
    async getAdmins(req) {
        return [
            { id: 1, fullName: 'Budi Santoso', email: 'budi@sman1jkt.sch.id', phoneNumber: '081298765432', role: 'admin', initials: 'BS', color: '#3B6BF6', avatarUrl: null },
            { id: 2, fullName: 'Rina Wulandari', email: 'rina@sman1jkt.sch.id', phoneNumber: '081377788899', role: 'admin', initials: 'RW', color: '#f97316', avatarUrl: null },
        ];
    }
    async inviteAdmin(req, email) {
        return { success: true, message: 'Undangan terkirim' };
    }
    async removeAdmin(req, adminId) {
        return { success: true, message: 'Admin dihapus' };
    }
};
exports.TenantInstitutionController = TenantInstitutionController;
__decorate([
    (0, common_1.Get)('tenant/institution'),
    (0, swagger_1.ApiOperation)({ summary: 'Data profil + aturan kerja instansi aktif' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantInstitutionController.prototype, "getInstitution", null);
__decorate([
    (0, common_1.Patch)('tenant/institution'),
    (0, swagger_1.ApiOperation)({ summary: 'Simpan pengaturan instansi' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TenantInstitutionController.prototype, "updateInstitution", null);
__decorate([
    (0, common_1.Patch)('tenant/institution/kiosk-pin'),
    (0, swagger_1.ApiOperation)({ summary: 'Ubah PIN kiosk' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('pin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TenantInstitutionController.prototype, "updateKioskPin", null);
__decorate([
    (0, common_1.Get)('tenant/admins'),
    (0, swagger_1.ApiOperation)({ summary: 'Daftar admin instansi' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantInstitutionController.prototype, "getAdmins", null);
__decorate([
    (0, common_1.Post)('tenant/admins/invitations'),
    (0, swagger_1.ApiOperation)({ summary: 'Undang admin baru' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TenantInstitutionController.prototype, "inviteAdmin", null);
__decorate([
    (0, common_1.Delete)('tenant/admins/:adminId'),
    (0, swagger_1.ApiOperation)({ summary: 'Hapus akses admin' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('adminId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TenantInstitutionController.prototype, "removeAdmin", null);
exports.TenantInstitutionController = TenantInstitutionController = __decorate([
    (0, swagger_1.ApiTags)('tenant-management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)({ version: '1' })
], TenantInstitutionController);
//# sourceMappingURL=tenant-institution.controller.js.map