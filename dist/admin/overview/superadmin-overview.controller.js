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
exports.SuperadminOverviewController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const supabase_service_1 = require("../../supabase/supabase.service");
let SuperadminOverviewController = class SuperadminOverviewController {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getStats() {
        const client = this.supabase.getClient();
        const { count: instCount } = await client.from('institutions').select('*', { count: 'exact', head: true });
        const { count: empCount } = await client.from('employees').select('*', { count: 'exact', head: true });
        const { data: payData } = await client
            .from('payments')
            .select('amount')
            .eq('verification_status', 'approved');
        const totalRevenue = (payData || []).reduce((acc, p) => acc + Number(p.amount), 0);
        const revenueDisplay = totalRevenue >= 1000000
            ? `Rp ${(totalRevenue / 1000000).toFixed(1)}jt`
            : `Rp ${(totalRevenue / 1000).toFixed(0)}rb`;
        const today = new Date().toISOString().split('T')[0];
        const { count: scanToday } = await client
            .from('attendance_logs')
            .select('*', { count: 'exact', head: true })
            .gte('scanned_at', today + ' 00:00:00');
        return [
            { label: 'Instansi Aktif', value: (instCount || 0).toString(), bg: 'bg-blue-50 border-blue-100/50 text-blue-600', icon: 'building' },
            { label: 'Pendapatan', value: revenueDisplay, bg: 'bg-emerald-50 border-emerald-100/50 text-emerald-600', icon: 'money' },
            { label: 'Pindaian Hari Ini', value: (scanToday || 0).toLocaleString('id-ID'), bg: 'bg-amber-50 border-amber-100/50 text-amber-600', icon: 'scan' },
            { label: 'Total User', value: (empCount || 0).toLocaleString('id-ID'), bg: 'bg-purple-50 border-purple-100/50 text-purple-600', icon: 'users' },
        ];
    }
    async getScanChart(range = '7d') {
        const client = this.supabase.getClient();
        const days = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
        const result = [];
        let countDays = parseInt(range) || 7;
        if (countDays > 100)
            countDays = 100;
        for (let i = countDays - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            let dayLabel = days[d.getDay()];
            if (countDays > 14) {
                dayLabel = d.getDate().toString();
            }
            const { count } = await client
                .from('attendance_logs')
                .select('*', { count: 'exact', head: true })
                .gte('scanned_at', dateStr + ' 00:00:00')
                .lt('scanned_at', dateStr + ' 23:59:59');
            result.push({
                label: dayLabel,
                val: count || 0,
                height: '0%'
            });
        }
        const maxVal = Math.max(...result.map(r => Number(r.val)), 1);
        return result.map(r => ({
            ...r,
            height: `${Math.max((Number(r.val) / maxVal) * 90, 5)}%`,
            highlight: Number(r.val) === maxVal && maxVal > 0
        }));
    }
    async getRecent(limit = 4) {
        const client = this.supabase.getClient();
        const { data: insts } = await client
            .from('institutions')
            .select(`
        id, 
        name, 
        plan, 
        initials,
        employees (id)
      `)
            .order('created_at', { ascending: false })
            .limit(limit);
        return (insts || []).map(inst => ({
            id: inst.id,
            name: inst.name,
            plan: (inst.plan || 'free').toUpperCase(),
            initials: (inst.initials || inst.name.substring(0, 2)).toUpperCase(),
            memberCount: inst.employees?.length || 0
        }));
    }
};
exports.SuperadminOverviewController = SuperadminOverviewController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Platform aggregates' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperadminOverviewController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('scan-chart'),
    (0, swagger_1.ApiOperation)({ summary: 'Scan analytics with dynamic range' }),
    __param(0, (0, common_1.Query)('range')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperadminOverviewController.prototype, "getScanChart", null);
__decorate([
    (0, common_1.Get)('recent-institutions'),
    (0, swagger_1.ApiOperation)({ summary: 'Newest tenants' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SuperadminOverviewController.prototype, "getRecent", null);
exports.SuperadminOverviewController = SuperadminOverviewController = __decorate([
    (0, swagger_1.ApiTags)('superadmin-overview'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)({ path: 'admin/overview', version: '1' }),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], SuperadminOverviewController);
//# sourceMappingURL=superadmin-overview.controller.js.map