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
exports.SuperadminInstitutionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const supabase_service_1 = require("../../supabase/supabase.service");
let SuperadminInstitutionsController = class SuperadminInstitutionsController {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getAll(query) {
        const client = this.supabase.getClient();
        const { data: insts } = await client
            .from('institutions')
            .select(`
        *,
        employees (id)
      `)
            .order('created_at', { ascending: false });
        return (insts || []).map(inst => ({
            id: inst.id,
            name: inst.name,
            categoryLabel: (inst.category || 'Lainnya').charAt(0).toUpperCase() + inst.category.slice(1),
            plan: (inst.plan || 'free').toUpperCase(),
            memberCount: inst.employees?.length || 0,
            maxEmployees: inst.max_employees || 0,
            expiresAt: inst.expires_at,
            subscriptionHealth: new Date(inst.expires_at) > new Date() ? 'active' : 'expired',
            initials: inst.initials || inst.name.substring(0, 2).toUpperCase()
        }));
    }
    async create(dto) {
        const client = this.supabase.getClient();
        const insertData = {
            name: dto.institutionName,
            category: dto.category,
            plan: dto.plan,
            contact_email: dto.primaryAdminEmail,
            phone: dto.whatsappNumber,
            initials: dto.institutionName.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase(),
            check_in_time: '07:30:00',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
        const { data, error } = await client
            .from('institutions')
            .insert([insertData])
            .select()
            .single();
        if (error)
            throw error;
        return { success: true, data };
    }
    async getOne(id) {
        const client = this.supabase.getClient();
        const { data } = await client
            .from('institutions')
            .select('*, employees(id)')
            .eq('id', id)
            .single();
        return data;
    }
    async update(id, dto) {
        const client = this.supabase.getClient();
        const { error } = await client.from('institutions').update(dto).eq('id', id);
        if (error)
            throw error;
        return { success: true, message: 'Data diperbarui' };
    }
    async getEmployees(id, query) {
        return [{ id: 1, name: 'Budi Santoso' }];
    }
    async getPayments(id, query) {
        return [{ id: 1, amount: 149000, date: '2026-04-01Z' }];
    }
};
exports.SuperadminInstitutionsController = SuperadminInstitutionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Daftar instansi (seluruh sistem)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperadminInstitutionsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tambah instansi baru' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperadminInstitutionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Detail instansi' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperadminInstitutionsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Edit / Suspend instansi' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperadminInstitutionsController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id/employees'),
    (0, swagger_1.ApiOperation)({ summary: 'Daftar anggota instansi tersebut' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperadminInstitutionsController.prototype, "getEmployees", null);
__decorate([
    (0, common_1.Get)(':id/payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Riwayat tagihan instansi tersebut' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperadminInstitutionsController.prototype, "getPayments", null);
exports.SuperadminInstitutionsController = SuperadminInstitutionsController = __decorate([
    (0, swagger_1.ApiTags)('superadmin-institutions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)({ path: 'admin/institutions', version: '1' }),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], SuperadminInstitutionsController);
//# sourceMappingURL=superadmin-institutions.controller.js.map