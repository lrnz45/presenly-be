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
exports.TenantEmployeesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const supabase_service_1 = require("../../supabase/supabase.service");
const cloudinary_service_1 = require("../../cloudinary/cloudinary.service");
function getInitials(name) {
    if (!name)
        return '??';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0)
        return '??';
    const s = parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    return s;
}
function getRandomColor() {
    const colorList = [
        '#1E3A8A',
        '#1D4ED8',
        '#2563EB',
        '#3B82F6',
        '#60A5FA',
        '#93C5FD',
        '#BFDBFE',
    ];
    const randomIndex = Math.floor(Math.random() * colorList.length);
    return String(colorList[randomIndex]);
}
function mapToFrontendDto(row) {
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
let TenantEmployeesController = class TenantEmployeesController {
    constructor(supabaseService, cloudinaryService) {
        this.supabaseService = supabaseService;
        this.cloudinaryService = cloudinaryService;
    }
    async getEmployees(req, query) {
        const supabase = this.supabaseService.getClient();
        const institutionId = req.user.institutionId;
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('institution_id', institutionId)
            .order('created_at', { ascending: false });
        if (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
        return (data || []).map(mapToFrontendDto);
    }
    async createEmployee(req, dto) {
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
            if (error.code === '23505' ||
                error.message.toLowerCase().includes('duplicate')) {
                throw new common_1.ConflictException('NIP / NIS / ID Karyawan ini sudah digunakan di instansi Anda.');
            }
            throw new common_1.InternalServerErrorException(error.message);
        }
        return { success: true, employee: mapToFrontendDto(data) };
    }
    async getEmployee(req, id) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('id', id)
            .eq('institution_id', req.user.institutionId)
            .maybeSingle();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        if (!data)
            throw new common_1.NotFoundException('Pegawai tidak ditemukan.');
        return mapToFrontendDto(data);
    }
    async updateEmployee(req, id, dto) {
        const supabase = this.supabaseService.getClient();
        const updateData = {};
        if (dto.name !== undefined) {
            updateData.name = dto.name;
            updateData.initials = getInitials(dto.name);
        }
        if (dto.identifierId !== undefined)
            updateData.identifier_id = dto.identifierId;
        if (dto.email !== undefined)
            updateData.email = dto.email;
        if (dto.jobTitle !== undefined)
            updateData.job_title = dto.jobTitle;
        if (dto.department !== undefined)
            updateData.department = dto.department;
        if (dto.isActive !== undefined)
            updateData.is_active = dto.isActive;
        if (dto.joinedAtDate !== undefined)
            updateData.joined_at = dto.joinedAtDate;
        const { data, error } = await supabase
            .from('employees')
            .update(updateData)
            .eq('id', id)
            .eq('institution_id', req.user.institutionId)
            .select('*')
            .single();
        if (error) {
            if (error.code === '23505') {
                throw new common_1.ConflictException('NIP / NIS / ID Karyawan ini sudah digunakan.');
            }
            throw new common_1.InternalServerErrorException(error.message);
        }
        return {
            success: true,
            message: 'Data diperbarui',
            employee: mapToFrontendDto(data),
        };
    }
    async removeEmployee(req, id) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase
            .from('employees')
            .delete()
            .eq('id', id)
            .eq('institution_id', req.user.institutionId);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return { success: true, message: 'Pegawai dihapus' };
    }
    async getEnrollment(req, id) {
        const supabase = this.supabaseService.getClient();
        const { count, error } = await supabase
            .from('face_embeddings')
            .select('*', { count: 'exact', head: true })
            .eq('employee_id', id);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return { count: count || 0, isReady: (count || 0) >= 1 };
    }
    async addSingleFaceSample(req, id, body) {
        console.log(`[DEBUG] addSingleFaceSample Hit untuk ID: ${id}, Index: ${body.sampleIndex}, isFirst: ${body.isFirst}`);
        const supabase = this.supabaseService.getClient();
        const institutionId = req.user.institutionId;
        const { data: employee, error: empErr } = await supabase
            .from('employees')
            .select('id')
            .eq('id', id)
            .eq('institution_id', institutionId)
            .single();
        if (empErr || !employee)
            throw new common_1.UnauthorizedException('Akses ditolak.');
        if (body.isFirst) {
            await supabase
                .from('face_embeddings')
                .delete()
                .eq('employee_id', employee.id);
        }
        let cloudinaryUrl = null;
        if (body.sample.image) {
            try {
                console.log(`[CLOUDINARY] Memulai upload untuk pegawai ${id} (sampel ${body.sampleIndex})...`);
                cloudinaryUrl = await this.cloudinaryService.uploadImageBase64(body.sample.image, `tenant_${institutionId}/employee_${employee.id}`);
                console.log(`[CLOUDINARY] Upload sukses: ${cloudinaryUrl}`);
            }
            catch (uploadErr) {
                console.error('[CLOUDINARY] Gagal upload:', uploadErr.message);
                if (body.isFirst) {
                    throw new common_1.InternalServerErrorException('Gagal upload foto profil ke Cloudinary: ' + uploadErr.message);
                }
            }
        }
        if (body.sample.sample_type === 'FRONTAL_SMILE' && cloudinaryUrl) {
            console.log(`[DB] Mengupdate avatar pegawai ${id} dengan foto FRONTAL_SMILE...`);
            await supabase
                .from('employees')
                .update({ photo_url: cloudinaryUrl })
                .eq('id', employee.id);
        }
        if (body.isFirst) {
            await supabase
                .from('employees')
                .update({ face_enrolled: false })
                .eq('id', employee.id);
        }
        console.log(`[DB] Menyimpan sampel ${body.sampleIndex} ke face_embeddings...`);
        const { error: insertErr } = await supabase.from('face_embeddings').insert({
            employee_id: employee.id,
            embedding: body.sample.embedding,
            sample_index: body.sampleIndex,
            sample_type: body.sample.sample_type || 'UNKNOWN',
            image_url: cloudinaryUrl,
        });
        if (insertErr) {
            console.error('[DB] Gagal simpan embedding:', insertErr.message);
            throw new common_1.InternalServerErrorException(insertErr.message);
        }
        if (body.isLast) {
            console.log(`[DB] Sampel TERAKHIR terdeteksi. Finalisasi status pegawai ${id}...`);
            await supabase
                .from('employees')
                .update({ face_enrolled: true })
                .eq('id', employee.id);
        }
        return { success: true, message: `Sampel ${body.sampleIndex} tersimpan.` };
    }
    async resetFaceSamples(req, id) {
        const supabase = this.supabaseService.getClient();
        const { error: delErr } = await supabase
            .from('face_embeddings')
            .delete()
            .eq('employee_id', id);
        if (delErr)
            throw new common_1.InternalServerErrorException(delErr.message);
        const { error: updErr } = await supabase
            .from('employees')
            .update({ face_enrolled: false })
            .eq('id', id)
            .eq('institution_id', req.user.institutionId);
        if (updErr)
            throw new common_1.InternalServerErrorException(updErr.message);
        return { success: true, message: 'Enrollment direset' };
    }
};
exports.TenantEmployeesController = TenantEmployeesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Daftar pegawai tenant' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TenantEmployeesController.prototype, "getEmployees", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tambah pegawai' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TenantEmployeesController.prototype, "createEmployee", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Detail satu pegawai' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TenantEmployeesController.prototype, "getEmployee", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Edit data pegawai' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TenantEmployeesController.prototype, "updateEmployee", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Hapus pegawai' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TenantEmployeesController.prototype, "removeEmployee", null);
__decorate([
    (0, common_1.Get)(':id/enrollment'),
    (0, swagger_1.ApiOperation)({ summary: 'Status sampel wajah' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TenantEmployeesController.prototype, "getEnrollment", null);
__decorate([
    (0, common_1.Post)(':id/face-samples-single'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload embedding wajah satu per satu' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TenantEmployeesController.prototype, "addSingleFaceSample", null);
__decorate([
    (0, common_1.Delete)(':id/face-samples'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset pendaftaran wajah' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TenantEmployeesController.prototype, "resetFaceSamples", null);
exports.TenantEmployeesController = TenantEmployeesController = __decorate([
    (0, swagger_1.ApiTags)('tenant-employees'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)({ path: 'tenant/employees', version: '1' }),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        cloudinary_service_1.CloudinaryService])
], TenantEmployeesController);
//# sourceMappingURL=tenant-employees.controller.js.map