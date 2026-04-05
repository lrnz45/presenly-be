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
exports.TenantAttendanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const supabase_service_1 = require("../../supabase/supabase.service");
let TenantAttendanceController = class TenantAttendanceController {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async getCalendar(req, query) {
        const supabase = this.supabaseService.getClient();
        const institutionId = req.user.institutionId;
        const now = new Date();
        const year = query.year || now.getFullYear();
        const month = query.month || now.getMonth() + 1;
        const monthStr = month.toString().padStart(2, '0');
        const monthKey = `${year}-${monthStr}`;
        const { data: employees, error: empErr } = await supabase
            .from('employees')
            .select('id, name, initials, avatar_color')
            .eq('institution_id', institutionId)
            .eq('is_active', true)
            .order('name');
        if (empErr) {
            console.error('[REKAP] Gagal ambil pegawai:', empErr.message);
            return { employees: [], attendance: {} };
        }
        const startDate = `${monthKey}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${monthKey}-${lastDay}`;
        const employeeIds = (employees || []).map(e => e.id);
        const { data: records, error: recErr } = await supabase
            .from('attendance_daily_records')
            .select('employee_id, record_date, day_code')
            .in('employee_id', employeeIds)
            .gte('record_date', startDate)
            .lte('record_date', endDate);
        if (recErr) {
            console.error('[REKAP] Gagal ambil records:', recErr.message);
            return { employees: employees || [], attendance: {} };
        }
        const attendanceMap = {};
        (records || []).forEach((r) => {
            const empId = r.employee_id;
            if (!attendanceMap[empId])
                attendanceMap[empId] = {};
            const day = parseInt(r.record_date.split('-')[2]);
            attendanceMap[empId][day] = r.day_code;
        });
        return {
            employees: (employees || []).map((e) => ({
                id: e.id,
                name: e.name,
                initials: e.initials,
                avatarColor: e.avatar_color,
            })),
            attendance: attendanceMap,
        };
    }
    async getLogs(query) {
        const supabase = this.supabaseService.getClient();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { data, error } = await supabase
            .from('attendance_logs')
            .select(`
        id,
        scanned_at,
        scan_type,
        employee_id,
        employees (
          name,
          job_title,
          department,
          photo_url
        )
      `)
            .gt('scanned_at', todayStart.toISOString())
            .order('scanned_at', { ascending: false })
            .limit(20);
        if (error)
            return [];
        return (data || []).map((log) => ({
            id: log.id,
            staffName: log.employees?.name || 'Unknown',
            subtitle: log.employees?.job_title || log.employees?.department || 'Staff',
            photoUrl: log.employees?.photo_url,
            checkInDisplay: new Date(log.scanned_at).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
            }),
            status: 'H',
            scanType: log.scan_type,
        }));
    }
    async getDailyRecord(id) {
        return { id, dayCode: 'H', checkInTime: '07:54' };
    }
    async updateDailyRecord(id, dto) {
        return { success: true };
    }
    async upsertDailyRecord(dto) {
        return { success: true, id: Date.now() };
    }
    async deleteDailyRecord(employeeId, recordDate) {
        return { success: true };
    }
    async exportExcel(query) {
        return { url: 'https://example.com/export.xlsx' };
    }
    async exportPdf(query) {
        return { url: 'https://example.com/export.pdf' };
    }
};
exports.TenantAttendanceController = TenantAttendanceController;
__decorate([
    (0, common_1.Get)('attendance-daily'),
    (0, swagger_1.ApiOperation)({ summary: 'Data rekap bulanan (attendance-daily)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TenantAttendanceController.prototype, "getCalendar", null);
__decorate([
    (0, common_1.Get)('attendance-logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Daftar riwayat mentah (attendance-logs)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantAttendanceController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Get)('attendance-daily/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Detail edit satu rekor' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantAttendanceController.prototype, "getDailyRecord", null);
__decorate([
    (0, common_1.Patch)('attendance-daily/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update rekor absensi' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantAttendanceController.prototype, "updateDailyRecord", null);
__decorate([
    (0, common_1.Put)('attendance-daily'),
    (0, swagger_1.ApiOperation)({ summary: 'Upsert satu sel rekap' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantAttendanceController.prototype, "upsertDailyRecord", null);
__decorate([
    (0, common_1.Delete)('attendance-daily'),
    (0, swagger_1.ApiOperation)({ summary: 'Hapus entri harian' }),
    __param(0, (0, common_1.Query)('employeeId')),
    __param(1, (0, common_1.Query)('recordDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TenantAttendanceController.prototype, "deleteDailyRecord", null);
__decorate([
    (0, common_1.Get)('exports/excel'),
    (0, swagger_1.ApiOperation)({ summary: 'Ekspor laporan Excel' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantAttendanceController.prototype, "exportExcel", null);
__decorate([
    (0, common_1.Get)('exports/pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Ekspor laporan PDF' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantAttendanceController.prototype, "exportPdf", null);
exports.TenantAttendanceController = TenantAttendanceController = __decorate([
    (0, swagger_1.ApiTags)('tenant-attendance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)({ path: 'institutions/me', version: '1' }),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], TenantAttendanceController);
//# sourceMappingURL=tenant-attendance.controller.js.map