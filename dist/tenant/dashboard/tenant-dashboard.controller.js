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
exports.TenantDashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const supabase_service_1 = require("../../supabase/supabase.service");
let TenantDashboardController = class TenantDashboardController {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getSummary(req, date) {
        const client = this.supabase.getClient();
        const instId = req.user.institutionId;
        const today = date || new Date().toISOString().split('T')[0];
        const { data: inst } = await client
            .from('institutions')
            .select('check_in_time, late_tolerance_minutes')
            .eq('id', instId)
            .single();
        const checkInTime = inst?.check_in_time || '07:00:00';
        const tolerance = inst?.late_tolerance_minutes || 0;
        const lateThreshold = `${today}T${checkInTime}Z`;
        const { count: presentCount } = await client
            .from('attendance_logs')
            .select('id, employees!inner(institution_id)', { count: 'exact', head: true })
            .eq('employees.institution_id', instId)
            .gte('scanned_at', `${today}T00:00:00Z`);
        const { count: lateCount } = await client
            .from('attendance_logs')
            .select('id, employees!inner(institution_id)', { count: 'exact', head: true })
            .eq('employees.institution_id', instId)
            .gte('scanned_at', `${today}T${checkInTime}Z`)
            .gte('scanned_at', `${today}T00:00:00Z`);
        const { count: faceCount } = await client
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('institution_id', instId)
            .not('face_embedding', 'is', null);
        const { count: activeCount } = await client
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('institution_id', instId)
            .eq('status', 'active');
        return [
            { label: 'HADIR HARI INI', value: (presentCount || 0).toLocaleString('id-ID'), iconBgClass: 'bg-blue-50 text-blue-600', icon: 'User' },
            { label: 'TERLAMBAT', value: (lateCount || 0).toLocaleString('id-ID'), iconBgClass: 'bg-amber-50 text-amber-600', icon: 'Clock' },
            { label: 'WAJAH TERDAFTAR', value: (faceCount || 0).toLocaleString('id-ID'), iconBgClass: 'bg-blue-50 text-blue-600', icon: 'ScanFace' },
            { label: 'PEGAWAI AKTIF', value: (activeCount || 0).toLocaleString('id-ID'), iconBgClass: 'bg-slate-50 text-slate-600', icon: 'Users' },
        ];
    }
    async getChart(req, range = '7d') {
        const client = this.supabase.getClient();
        const instId = req.user.institutionId;
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
                .select('id, employees!inner(institution_id)', { count: 'exact', head: true })
                .eq('employees.institution_id', instId)
                .gte('scanned_at', dateStr + 'T00:00:00Z')
                .lt('scanned_at', dateStr + 'T23:59:59Z');
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
    async getLiveScans(req, limit = 20) {
        const client = this.supabase.getClient();
        const instId = req.user.institutionId;
        const { data } = await client
            .from('attendance_logs')
            .select(`
        id,
        scanned_at,
        scan_type,
        confidence,
        employees!inner(full_name, institution_id)
      `)
            .eq('employees.institution_id', instId)
            .order('scanned_at', { ascending: false })
            .limit(limit);
        return (data || []).map(log => ({
            id: log.id,
            name: log.employees?.full_name || 'Anonymous',
            terminalLabel: 'SCANNER UTAMA',
            timeDisplay: new Date(log.scanned_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            matchLabel: `MIRIP ${(Number(log.confidence) || 0).toFixed(0)}%`,
            presence: 'online'
        }));
    }
    async getEarlyArrivals(req, limit = 5) {
        const client = this.supabase.getClient();
        const instId = req.user.institutionId;
        const now = new Date();
        const localToday = new Date(now.getTime() + (7 * 60 * 60 * 1000));
        const todayStr = localToday.toISOString().split('T')[0];
        const { data } = await client
            .from('attendance_logs')
            .select(`
        id,
        scanned_at,
        employees!inner(id, full_name, employee_code, institution_id)
      `)
            .eq('employees.institution_id', instId)
            .gte('scanned_at', `${todayStr}T00:00:00`)
            .order('scanned_at', { ascending: true })
            .limit(limit);
        return (data || []).map(log => ({
            id: log.employees?.id,
            fullName: log.employees?.full_name,
            employeeCode: log.employees?.employee_code,
            scannedAt: log.scanned_at
        }));
    }
};
exports.TenantDashboardController = TenantDashboardController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Kartu stat, angka agregat' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TenantDashboardController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('attendance-chart'),
    (0, swagger_1.ApiOperation)({ summary: 'Grafik mingguan' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('range')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TenantDashboardController.prototype, "getChart", null);
__decorate([
    (0, common_1.Get)('live-scans'),
    (0, swagger_1.ApiOperation)({ summary: 'Deteksi live' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], TenantDashboardController.prototype, "getLiveScans", null);
__decorate([
    (0, common_1.Get)('early-arrivals'),
    (0, swagger_1.ApiOperation)({ summary: 'Kartu kedatangan pagi' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], TenantDashboardController.prototype, "getEarlyArrivals", null);
exports.TenantDashboardController = TenantDashboardController = __decorate([
    (0, swagger_1.ApiTags)('tenant-dashboard'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)({ path: 'tenant/dashboard', version: '1' }),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], TenantDashboardController);
//# sourceMappingURL=tenant-dashboard.controller.js.map