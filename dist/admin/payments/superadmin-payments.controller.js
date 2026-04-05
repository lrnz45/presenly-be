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
exports.SuperadminPaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const supabase_service_1 = require("../../supabase/supabase.service");
let SuperadminPaymentsController = class SuperadminPaymentsController {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getAll(query) {
        const client = this.supabase.getClient();
        let q = client.from('payments').select('*, institutions(name, initials, category)');
        if (query.status) {
            q = q.eq('verification_status', query.status);
        }
        const { data: pays } = await q.order('uploaded_at', { ascending: false });
        return (pays || []).map(p => ({
            id: p.id,
            institutionId: p.institution_id,
            tenantName: p.institutions?.name || 'Unknown',
            categoryLabel: p.institutions?.category || 'General',
            tenantInitials: p.institutions?.initials || '??',
            plan: p.plan.toUpperCase(),
            amount: Number(p.amount),
            amountDisplay: `Rp ${Number(p.amount).toLocaleString('id-ID')}`,
            uploadedAtDisplay: new Date(p.uploaded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            transactionId: p.transaction_id,
            invoiceNumber: p.invoice_number,
            verificationStatus: p.verification_status,
            paymentStatus: p.payment_status,
            proofUrl: p.proof_url
        }));
    }
    async getOne(id) {
        const client = this.supabase.getClient();
        const { data } = await client
            .from('payments')
            .select('*, institutions(name, contact_email)')
            .eq('id', id)
            .single();
        return data;
    }
    async approve(id) {
        const client = this.supabase.getClient();
        const { data: pay } = await client
            .from('payments')
            .select('institution_id, plan, amount')
            .eq('id', id)
            .single();
        if (!pay)
            throw new Error('Pembayaran tidak ditemukan');
        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + 30);
        const maxEmps = pay.plan === 'premium' ? 2000 : 200;
        await client
            .from('institutions')
            .update({
            plan: pay.plan,
            expires_at: newExpiry.toISOString(),
            max_employees: maxEmps
        })
            .eq('id', pay.institution_id);
        const { error } = await client
            .from('payments')
            .update({
            verification_status: 'approved',
            payment_status: 'paid',
            approved_at: new Date().toISOString()
        })
            .eq('id', id);
        if (error)
            throw error;
        return { success: true, message: 'Pembayaran disetujui, paket diperbarui' };
    }
    async reject(id, dto) {
        const client = this.supabase.getClient();
        const { error } = await client
            .from('payments')
            .update({
            verification_status: 'rejected',
            payment_status: 'pending'
        })
            .eq('id', id);
        if (error)
            throw error;
        return { success: true, message: 'Pembayaran ditolak' };
    }
};
exports.SuperadminPaymentsController = SuperadminPaymentsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Daftar transaksi tertunda / sukses (platform)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperadminPaymentsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Detail transaksi + bukti' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperadminPaymentsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Setujui pembayaran' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperadminPaymentsController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Tolak pembayaran' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperadminPaymentsController.prototype, "reject", null);
exports.SuperadminPaymentsController = SuperadminPaymentsController = __decorate([
    (0, swagger_1.ApiTags)('superadmin-payments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)({ path: 'admin/payments', version: '1' }),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], SuperadminPaymentsController);
//# sourceMappingURL=superadmin-payments.controller.js.map