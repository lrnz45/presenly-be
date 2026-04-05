import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// Sesuaikan path import SupabaseService dengan struktur folder Anda
import { SupabaseService } from '../../supabase/supabase.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

// --- Helper Functions ---
function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  const s =
    parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  return s;
}

function getRandomColor(): string {
  const colorList: string[] = [
    '#1E3A8A', // biru sangat gelap
    '#1D4ED8', // biru utama
    '#2563EB', // biru sedikit lebih terang
    '#3B82F6', // biru standar
    '#60A5FA', // biru soft
    '#93C5FD', // biru lebih light
    '#BFDBFE', // biru paling terang
  ];
  // Hitung index acak
  const randomIndex: number = Math.floor(Math.random() * colorList.length);

  // Kembalikan satu warna berdasarkan index (berupa string tunggal)
  return String(colorList[randomIndex]);
}

function mapToFrontendDto(row: any) {
  return {
    id: row.id,
    identifierId: row.identifier_id,
    name: row.name,
    email: row.email,
    jobTitle: row.job_title,
    department: row.department,
    faceEnrolled: row.face_enrolled,
    joinedAtDate: row.joined_at,
    initials: row.initials,
    avatarColor: row.avatar_color,
    photoUrl: row.photo_url,
    isActive: row.is_active,
  };
}

@ApiTags('tenant-employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'tenant/employees', version: '1' })
export class TenantEmployeesController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Daftar pegawai tenant' })
  async getEmployees(@Request() req: any, @Query() query: any) {
    const supabase = this.supabaseService.getClient();
    const institutionId = req.user.institutionId; // Diambil dari JWT Payload

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('institution_id', institutionId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data || []).map(mapToFrontendDto);
  }

  @Post()
  @ApiOperation({ summary: 'Tambah pegawai' })
  async createEmployee(@Request() req: any, @Body() dto: any) {
    const supabase = this.supabaseService.getClient();
    const institutionId = req.user.institutionId;

    const newRow = {
      institution_id: institutionId,
      identifier_id: dto.identifierId,
      name: dto.name,
      email: dto.email || null,
      job_title: dto.jobTitle || null,
      department: dto.department || null,
      joined_at: dto.joinedAtDate || new Date().toISOString().split('T')[0],
      initials: getInitials(dto.name),
      avatar_color: getRandomColor(),
      is_active: dto.isActive !== undefined ? dto.isActive : true,
      face_enrolled: false,
    };

    const { data, error } = await supabase
      .from('employees')
      .insert(newRow)
      .select('*')
      .single();

    if (error) {
      if (
        error.code === '23505' ||
        error.message.toLowerCase().includes('duplicate')
      ) {
        throw new ConflictException(
          'NIP / NIS / ID Karyawan ini sudah digunakan di instansi Anda.',
        );
      }
      throw new InternalServerErrorException(error.message);
    }

    return { success: true, employee: mapToFrontendDto(data) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail satu pegawai' })
  async getEmployee(@Request() req: any, @Param('id') id: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .eq('institution_id', req.user.institutionId)
      .maybeSingle();

    if (error) throw new InternalServerErrorException(error.message);
    if (!data) throw new NotFoundException('Pegawai tidak ditemukan.');

    return mapToFrontendDto(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit data pegawai' })
  async updateEmployee(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    const supabase = this.supabaseService.getClient();
    const updateData: any = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
      updateData.initials = getInitials(dto.name);
    }
    if (dto.identifierId !== undefined)
      updateData.identifier_id = dto.identifierId;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.jobTitle !== undefined) updateData.job_title = dto.jobTitle;
    if (dto.department !== undefined) updateData.department = dto.department;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
    if (dto.joinedAtDate !== undefined) updateData.joined_at = dto.joinedAtDate;

    const { data, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .eq('institution_id', req.user.institutionId) // Guard: hanya bisa edit pegawai instansi sendiri
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'NIP / NIS / ID Karyawan ini sudah digunakan.',
        );
      }
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      message: 'Data diperbarui',
      employee: mapToFrontendDto(data),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus pegawai' })
  async removeEmployee(@Request() req: any, @Param('id') id: string) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)
      .eq('institution_id', req.user.institutionId);

    if (error) throw new InternalServerErrorException(error.message);

    return { success: true, message: 'Pegawai dihapus' };
  }

  // --- Bagian Enrollment Wajah ---

  @Get(':id/enrollment')
  @ApiOperation({ summary: 'Status sampel wajah' })
  async getEnrollment(@Request() req: any, @Param('id') id: string) {
    const supabase = this.supabaseService.getClient();
    // Hitung jumlah embedding wajah dari database asli
    const { count, error } = await supabase
      .from('face_embeddings')
      .select('*', { count: 'exact', head: true })
      .eq('employee_id', id);

    if (error) throw new InternalServerErrorException(error.message);

    return { count: count || 0, isReady: (count || 0) >= 1 }; // Anggap siap jika ada minimal 1 sampel
  }

  @Post(':id/face-samples-single')
  @ApiOperation({ summary: 'Upload embedding wajah satu per satu' })
  async addSingleFaceSample(
    @Request() req: any,
    @Param('id') id: string,
    @Body()
    body: {
      sample: any; // Berisi embedding dan .image (Base64)
      sampleIndex: number;
      isFirst: boolean;
      isLast: boolean;
    },
  ) {
    console.log(`[DEBUG] addSingleFaceSample Hit untuk ID: ${id}, Index: ${body.sampleIndex}, isFirst: ${body.isFirst}`);
    const supabase = this.supabaseService.getClient();
    const institutionId = req.user.institutionId;

    // 1. Verifikasi akses pegawai
    const { data: employee, error: empErr } = await supabase
      .from('employees')
      .select('id')
      .eq('id', id)
      .eq('institution_id', institutionId)
      .single();

    if (empErr || !employee) throw new UnauthorizedException('Akses ditolak.');

    // 2. Hapus data lama jika ini adalah sampel PERTAMA
    if (body.isFirst) {
      await supabase
        .from('face_embeddings')
        .delete()
        .eq('employee_id', employee.id);
    }

    // --- LOGIKA CLOUDINARY ---
    let cloudinaryUrl: string | null = null;
    if (body.sample.image) {
      try {
        console.log(`[CLOUDINARY] Memulai upload untuk pegawai ${id} (sampel ${body.sampleIndex})...`);
        cloudinaryUrl = await this.cloudinaryService.uploadImageBase64(
          body.sample.image,
          `tenant_${institutionId}/employee_${employee.id}`,
        );
        console.log(`[CLOUDINARY] Upload sukses: ${cloudinaryUrl}`);
      } catch (uploadErr: any) {
        console.error('[CLOUDINARY] Gagal upload:', uploadErr.message);
        // Jika ini sampel pertama, kita sebaiknya gagalkan saja karena foto profil sangat penting
        if (body.isFirst) {
          throw new InternalServerErrorException('Gagal upload foto profil ke Cloudinary: ' + uploadErr.message);
        }
      }
    }

    // --- UPDATE PHOTO_URL JIKA SAMPEL SENYUM ---
    if (body.sample.sample_type === 'FRONTAL_SMILE' && cloudinaryUrl) {
      console.log(`[DB] Mengupdate avatar pegawai ${id} dengan foto FRONTAL_SMILE...`);
      await supabase
        .from('employees')
        .update({ photo_url: cloudinaryUrl })
        .eq('id', employee.id);
    }

    // RESET ENROLL STATUS JIKA SAMPEL PERTAMA
    if (body.isFirst) {
      await supabase
        .from('employees')
        .update({ face_enrolled: false })
        .eq('id', employee.id);
    }

    // 3. Masukkan 1 sampel ke database Supabase (TERMASUK URL GAMBAR)
    console.log(`[DB] Menyimpan sampel ${body.sampleIndex} ke face_embeddings...`);
    const { error: insertErr } = await supabase.from('face_embeddings').insert({
      employee_id: employee.id,
      embedding: body.sample.embedding,
      sample_index: body.sampleIndex,
      sample_type: body.sample.sample_type || 'UNKNOWN',
      image_url: cloudinaryUrl, // <-- Masukkan URL dari Cloudinary ke sini
    });

    if (insertErr) {
      console.error('[DB] Gagal simpan embedding:', insertErr.message);
      throw new InternalServerErrorException(insertErr.message);
    }

    // 4. Jika ini sampel TERAKHIR, tandai pendaftaran wajah selesai
    if (body.isLast) {
      console.log(`[DB] Sampel TERAKHIR terdeteksi. Finalisasi status pegawai ${id}...`);
      await supabase
        .from('employees')
        .update({ face_enrolled: true })
        .eq('id', employee.id);
    }

    return { success: true, message: `Sampel ${body.sampleIndex} tersimpan.` };
  }

  @Delete(':id/face-samples')
  @ApiOperation({ summary: 'Reset pendaftaran wajah' })
  async resetFaceSamples(@Request() req: any, @Param('id') id: string) {
    const supabase = this.supabaseService.getClient();

    // Hapus dari tabel embeddings
    const { error: delErr } = await supabase
      .from('face_embeddings')
      .delete()
      .eq('employee_id', id);

    if (delErr) throw new InternalServerErrorException(delErr.message);

    // Update status employee
    const { error: updErr } = await supabase
      .from('employees')
      .update({ face_enrolled: false })
      .eq('id', id)
      .eq('institution_id', req.user.institutionId);

    if (updErr) throw new InternalServerErrorException(updErr.message);

    return { success: true, message: 'Enrollment direset' };
  }
}
