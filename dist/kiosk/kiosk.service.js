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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KioskService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let KioskService = class KioskService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async identifyFace(embedding) {
        const supabase = this.supabaseService.getClient();
        const { data: rpcData, error: rpcError } = await supabase.rpc('match_face_embeddings', {
            query_embedding: embedding,
            match_threshold: 0.6,
            match_count: 1,
        });
        if (rpcError) {
            console.error('[RPC Error]:', rpcError.message);
            throw new common_1.InternalServerErrorException(rpcError.message);
        }
        if (!rpcData || rpcData.length === 0) {
            console.warn('[DEBUG] Wajah tidak ditemukan di Vector DB');
            return { success: false };
        }
        const bestMatch = rpcData[0];
        console.log(`[DEBUG] Match Found! ID: ${bestMatch.employee_id}, Score: ${bestMatch.similarity}`);
        const { data: employee, error: empError } = await supabase
            .from('employees')
            .select('id, name, job_title, department, institution_id, photo_url')
            .eq('id', bestMatch.employee_id)
            .single();
        if (empError || !employee) {
            console.error('[DEBUG] Wajah cocok tapi data karyawan tidak ditemukan di tabel employees:', empError?.message);
            return { success: false, message: 'Karyawan tidak ditemukan' };
        }
        return {
            success: true,
            employeeId: employee.id.toString(),
            institutionId: employee.institution_id,
            name: employee.name,
            subtitle: employee.job_title || employee.department || 'Staff',
            photoUrl: employee.photo_url,
            confidence: Math.round(bestMatch.similarity * 100),
        };
    }
    async logAttendance(dto) {
        const supabase = this.supabaseService.getClient();
        if (dto.nonce) {
            const { data: nonceData, error: nError } = await supabase
                .from('attendance_nonces')
                .select('*')
                .eq('nonce', dto.nonce)
                .eq('is_used', false)
                .gt('expires_at', new Date().toISOString())
                .maybeSingle();
            if (nError || !nonceData) {
                throw new common_1.BadRequestException('Security Token (Nonce) tidak valid atau sudah kedaluwarsa.');
            }
            await supabase.from('attendance_nonces').update({ is_used: true }).eq('nonce', dto.nonce);
        }
        const FIVE_MINUTES_AGO = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { data: recentLog } = await supabase
            .from('attendance_logs')
            .select('id')
            .eq('employee_id', dto.employeeId)
            .eq('scan_type', dto.scanType)
            .gt('scanned_at', FIVE_MINUTES_AGO)
            .limit(1)
            .maybeSingle();
        if (recentLog) {
            return { id: recentLog.id, skip: true };
        }
        const nowWib = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace(' ', 'T');
        const { data: logData, error: logErr } = await supabase
            .from('attendance_logs')
            .insert([
            {
                employee_id: dto.employeeId,
                scan_type: dto.scanType,
                confidence: dto.confidence,
                scanned_at: nowWib,
            },
        ])
            .select()
            .single();
        if (logErr)
            throw logErr;
        let finalLabel = 'Berhasil';
        try {
            const timezone = 'Asia/Jakarta';
            const today = new Date();
            const todayStr = today.toLocaleDateString('en-CA', { timeZone: timezone });
            const nowTime = today.toLocaleTimeString('id-ID', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }).replace('.', ':');
            const { data: emp } = await supabase
                .from('employees')
                .select(`
          id,
          name,
          institutions (id, check_in_time, check_out_time, late_tolerance_minutes, active_weekdays, attendance_mode)
        `)
                .eq('id', dto.employeeId)
                .single();
            if (emp && emp.institutions) {
                const inst = emp.institutions;
                const configIn = inst.check_in_time;
                const configOut = inst.check_out_time;
                const tolerance = inst.late_tolerance_minutes || 0;
                const activeWeekdays = inst.active_weekdays || ['sen', 'sel', 'rab', 'kam', 'jum'];
                const dayNames = ['min', 'sen', 'sel', 'rab', 'kam', 'jum', 'sab'];
                const todayDayName = dayNames[today.getDay()];
                const isWorkDay = activeWeekdays.includes(todayDayName);
                const { data: existingDaily } = await supabase
                    .from('attendance_daily_records')
                    .select('id, day_code')
                    .eq('employee_id', dto.employeeId)
                    .eq('record_date', todayStr)
                    .maybeSingle();
                if (dto.scanType === 'IN') {
                    if (!existingDaily) {
                        let dayCode = 'H';
                        finalLabel = 'Tepat Waktu';
                        if (configIn && isWorkDay) {
                            const [cHour, cMin] = configIn.split(':').map(Number);
                            const [nHour, nMin] = nowTime.split(':').map(Number);
                            const configInMinutes = (cHour * 60) + cMin + tolerance;
                            const actualInMinutes = (nHour * 60) + nMin;
                            if (actualInMinutes > configInMinutes) {
                                dayCode = 'T';
                                finalLabel = 'Terlambat';
                            }
                        }
                        else if (!isWorkDay) {
                            finalLabel = 'Lembur / Hari Libur';
                        }
                        await supabase.from('attendance_daily_records').insert({
                            employee_id: dto.employeeId,
                            record_date: todayStr,
                            check_in_time: nowTime,
                            day_code: dayCode,
                        });
                    }
                    else {
                        finalLabel = 'Sudah Masuk';
                    }
                }
                else if (dto.scanType === 'OUT') {
                    finalLabel = 'Berhasil Pulang';
                    if (inst.attendance_mode !== 'in_only') {
                        if (existingDaily) {
                            await supabase
                                .from('attendance_daily_records')
                                .update({ check_out_time: nowTime })
                                .eq('id', existingDaily.id);
                        }
                        else {
                            await supabase.from('attendance_daily_records').insert({
                                employee_id: dto.employeeId,
                                record_date: todayStr,
                                check_out_time: nowTime,
                                day_code: 'H',
                            });
                        }
                    }
                }
            }
        }
        catch (syncErr) {
            console.error('[SYNC] Gagal update rekap harian:', syncErr.message);
        }
        return {
            id: logData.id,
            timeDisplay: new Date().toLocaleTimeString('id-ID', {
                timeZone: 'Asia/Jakarta',
                hour: '2-digit',
                minute: '2-digit',
            }),
            punctualityLabel: finalLabel,
        };
    }
    async verifyExitPin(pin) {
        const ADMIN_PIN = '123456';
        return { success: pin === ADMIN_PIN };
    }
    async getDailyStats() {
        const supabase = this.supabaseService.getClient();
        const todayStr = new Date().toISOString().split('T')[0];
        const { count: totalCount } = await supabase
            .from('attendance_daily_records')
            .select('*', { count: 'exact', head: true })
            .eq('record_date', todayStr)
            .in('day_code', ['H', 'T']);
        const { count: lateCount } = await supabase
            .from('attendance_daily_records')
            .select('*', { count: 'exact', head: true })
            .eq('record_date', todayStr)
            .eq('day_code', 'T');
        const { count: empTotal } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);
        const total = totalCount || 0;
        const late = lateCount || 0;
        const employeeTotal = empTotal || 0;
        const missing = Math.max(0, employeeTotal - total);
        const rate = employeeTotal ? Math.round((total / employeeTotal) * 100) : 0;
        return { total, late, rate, missing, employeeTotal };
    }
    async getAttendanceLogs() {
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
          department
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
            checkInDisplay: new Date(log.scanned_at).toLocaleTimeString('id-ID', {
                timeZone: 'Asia/Jakarta',
                hour: '2-digit',
                minute: '2-digit',
            }),
            status: 'H',
            scanType: log.scan_type,
        }));
    }
    async createNonce(institutionId) {
        const supabase = this.supabaseService.getClient();
        const nonce = 'n-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        const { error } = await supabase.from('attendance_nonces').insert({
            nonce,
            institution_id: institutionId || null,
            expires_at: expiresAt,
            is_used: false,
        });
        if (error)
            throw new common_1.InternalServerErrorException('Gagal membuat security token');
        return { nonce };
    }
};
exports.KioskService = KioskService;
exports.KioskService = KioskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], KioskService);
//# sourceMappingURL=kiosk.service.js.map