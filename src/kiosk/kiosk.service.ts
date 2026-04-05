// kiosk.service.ts

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class KioskService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async identifyFace(embedding: number[]) {
    const supabase = this.supabaseService.getClient();

    // 1. Jalankan RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'match_face_embeddings',
      {
        query_embedding: embedding,
        match_threshold: 0.6, // Gunakan 0.60 agar lebih fleksibel
        match_count: 1,
      },
    );

    if (rpcError) {
      console.error('[RPC Error]:', rpcError.message);
      throw new InternalServerErrorException(rpcError.message);
    }

    // 2. Cek apakah ada hasil dari RPC
    if (!rpcData || rpcData.length === 0) {
      console.warn('[DEBUG] Wajah tidak ditemukan di Vector DB');
      return { success: false };
    }

    const bestMatch = rpcData[0];
    console.log(
      `[DEBUG] Match Found! ID: ${bestMatch.employee_id}, Score: ${bestMatch.similarity}`,
    );

    // 3. Ambil data karyawan (PASTIKAN nama kolom 'id' dan 'name' sudah benar)
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('id, name, job_title, department, institution_id, photo_url')
      .eq('id', bestMatch.employee_id)
      .single();

    if (empError || !employee) {
      console.error(
        '[DEBUG] Wajah cocok tapi data karyawan tidak ditemukan di tabel employees:',
        empError?.message,
      );
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

  async logAttendance(dto: { employeeId: number; scanType: string; confidence: number; nonce?: string }) {
    const supabase = this.supabaseService.getClient();

    // 1. Validasi Nonce di Database
    if (dto.nonce) {
      const { data: nonceData, error: nError } = await supabase
        .from('attendance_nonces')
        .select('*')
        .eq('nonce', dto.nonce)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (nError || !nonceData) {
        throw new BadRequestException('Security Token (Nonce) tidak valid atau sudah kedaluwarsa.');
      }

      // Tandai nonce sudah digunakan
      await supabase.from('attendance_nonces').update({ is_used: true }).eq('nonce', dto.nonce);
    }

    // 2. Cek Duplikasi (5 menit)
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

    // 3. Simpan Log Mentah
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

    if (logErr) throw logErr;

    // 4. Sinkronisasi ke Rekap Harian (attendance_daily_records)
    let finalLabel = 'Berhasil';
    try {
      const timezone = 'Asia/Jakarta';
      const today = new Date();
      
      // 1. Dapatkan Tanggal (YYYY-MM-DD) sesuai WIB
      const todayStr = today.toLocaleDateString('en-CA', { timeZone: timezone }); // Format en-CA menghasilkan YYYY-MM-DD
      
      // 2. Dapatkan Jam (HH:mm) sesuai WIB
      const nowTime = today.toLocaleTimeString('id-ID', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).replace('.', ':');

      // Ambil data instansi & jam kerja
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
        const inst = emp.institutions as any;
        const configIn = inst.check_in_time;
        const configOut = inst.check_out_time;
        const tolerance = inst.late_tolerance_minutes || 0;
        const activeWeekdays = inst.active_weekdays || ['sen', 'sel', 'rab', 'kam', 'jum'];
        
        // Cek Hari Kerja
        const dayNames = ['min', 'sen', 'sel', 'rab', 'kam', 'jum', 'sab'];
        const todayDayName = dayNames[today.getDay()];
        const isWorkDay = activeWeekdays.includes(todayDayName);

        // Cek apakah sudah ada rekor hari ini
        const { data: existingDaily } = await supabase
          .from('attendance_daily_records')
          .select('id, day_code')
          .eq('employee_id', dto.employeeId)
          .eq('record_date', todayStr)
          .maybeSingle();

        if (dto.scanType === 'IN') {
          if (!existingDaily) {
            // Hitung Keterlambatan
            let dayCode = 'H';
            finalLabel = 'Tepat Waktu';

            if (configIn && isWorkDay) {
              const [cHour, cMin] = configIn.split(':').map(Number);
              const [nHour, nMin] = nowTime.split(':').map(Number);
              
              const configInMinutes = (cHour * 60) + cMin + tolerance;
              const actualInMinutes = (nHour * 60) + nMin;
              
              if (actualInMinutes > configInMinutes) {
                dayCode = 'T'; // Terlambat
                finalLabel = 'Terlambat';
              }
            } else if (!isWorkDay) {
              finalLabel = 'Lembur / Hari Libur';
            }

            await supabase.from('attendance_daily_records').insert({
              employee_id: dto.employeeId,
              record_date: todayStr,
              check_in_time: nowTime,
              day_code: dayCode,
            });
          } else {
            finalLabel = 'Sudah Masuk';
          }
        } else if (dto.scanType === 'OUT') {
           finalLabel = 'Berhasil Pulang';
           if (inst.attendance_mode !== 'in_only') {
              if (existingDaily) {
                await supabase
                  .from('attendance_daily_records')
                  .update({ check_out_time: nowTime })
                  .eq('id', existingDaily.id);
              } else {
                // Scan pulang tanpa scan masuk
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
    } catch (syncErr) {
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

  async verifyExitPin(pin: string) {
    // Sesuaikan PIN admin Anda
    const ADMIN_PIN = '123456';
    return { success: pin === ADMIN_PIN };
  }

  async getDailyStats() {
    const supabase = this.supabaseService.getClient();
    const todayStr = new Date().toISOString().split('T')[0];

    // Total Hadir Hari Ini (Unique Employee IDs)
    const { count: totalCount } = await supabase
      .from('attendance_daily_records')
      .select('*', { count: 'exact', head: true })
      .eq('record_date', todayStr)
      .in('day_code', ['H', 'T']);

    // Total Terlambat Hari Ini
    const { count: lateCount } = await supabase
      .from('attendance_daily_records')
      .select('*', { count: 'exact', head: true })
      .eq('record_date', todayStr)
      .eq('day_code', 'T');

    // Total Karyawan (untuk persentase kehadiran)
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

    if (error) return [];

    return (data || []).map((log: any) => ({
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

  // --- NONCE MANAGEMENT ---
  async createNonce(institutionId?: number) {
    const supabase = this.supabaseService.getClient();
    // Gunakan string acak sederhana sebagai nonce
    const nonce = 'n-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // Berlaku 5 menit

    const { error } = await supabase.from('attendance_nonces').insert({
      nonce,
      institution_id: institutionId || null,
      expires_at: expiresAt,
      is_used: false,
    });

    if (error) throw new InternalServerErrorException('Gagal membuat security token');
    return { nonce };
  }
}
