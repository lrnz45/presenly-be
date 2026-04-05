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
exports.TenantBillingController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const supabase_service_1 = require("../../supabase/supabase.service");
const cloudinary_service_1 = require("../../cloudinary/cloudinary.service");
let TenantBillingController = class TenantBillingController {
    constructor(supabase, cloudinary) {
        this.supabase = supabase;
        this.cloudinary = cloudinary;
    }
    async getPlan(req) {
        const client = this.supabase.getClient();
        const instId = req.user.institutionId;
        const { data: inst } = await client
            .from('institutions')
            .select('plan, max_employees, expires_at, created_at')
            .eq('id', instId)
            .single();
        let plan = inst?.plan || 'free';
        let maxEmployees = inst?.max_employees || 15;
        let expiresAt = inst?.expires_at;
        if (plan === 'free') {
            maxEmployees = 25;
            if (inst?.created_at) {
                const trialEndDate = new Date(inst.created_at);
                trialEndDate.setDate(trialEndDate.getDate() + 30);
                expiresAt = trialEndDate.toISOString();
            }
        }
        const { count } = await client
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('institution_id', instId)
            .eq('status', 'active');
        return {
            plan,
            maxEmployees,
            expiresAt,
            activeEmployeeCount: count || 0
        };
    }
    async getPayments(req, limit = 10) {
        const client = this.supabase.getClient();
        const instId = req.user.institutionId;
        const { data } = await client
            .from('payments')
            .select('*')
            .eq('institution_id', instId)
            .order('uploaded_at', { ascending: false })
            .limit(limit);
        return (data || []).map(p => ({
            id: p.id,
            packageLabel: `Paket ${(p.plan || 'basic').toUpperCase()}`,
            dateDisplay: new Date(p.uploaded_at || p.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
            amountDisplay: `Rp ${Number(p.amount).toLocaleString('id-ID')}`,
            amount: p.amount,
            transactionId: p.id.toString().padStart(6, '0'),
            invoiceNumber: `INV-${p.id}`,
            verificationStatus: p.verification_status,
            paymentStatus: p.verification_status === 'approved' ? 'paid' : 'pending',
            proofUrl: p.proof_url
        }));
    }
    async submitPayment(req, dto) {
        const client = this.supabase.getClient();
        const instId = req.user.institutionId;
        const { error } = await client.from('payments').insert({
            institution_id: instId,
            plan: dto.plan || 'basic',
            amount: dto.amount,
            proof_url: dto.proofUrl,
            verification_status: 'pending',
            payment_status: 'pending',
            uploaded_at: new Date().toISOString()
        });
        if (error) {
            console.error('[Billing SUBMIT Error]', error);
            return { success: false, message: error.message };
        }
        return { success: true, message: 'Bukti pembayaran dikirim' };
    }
    async uploadProof(file) {
        if (!file) {
            return { url: null, message: 'No file uploaded' };
        }
        const url = await this.cloudinary.uploadFile(file, 'payment_proofs');
        return { url };
    }
};
exports.TenantBillingController = TenantBillingController;
__decorate([
    (0, common_1.Get)('plan'),
    (0, swagger_1.ApiOperation)({ summary: 'Status paket, kuota, expires_at' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantBillingController.prototype, "getPlan", null);
__decorate([
    (0, common_1.Get)('payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Riwayat transaksi tenant' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], TenantBillingController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Post)('payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Kirim bukti transfer' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TenantBillingController.prototype, "submitPayment", null);
__decorate([
    (0, common_1.Post)('uploads/proof'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Unggah file bukti' }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantBillingController.prototype, "uploadProof", null);
exports.TenantBillingController = TenantBillingController = __decorate([
    (0, swagger_1.ApiTags)('tenant-billing'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)({ path: 'tenant/billing', version: '1' }),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        cloudinary_service_1.CloudinaryService])
], TenantBillingController);
//# sourceMappingURL=tenant-billing.controller.js.map