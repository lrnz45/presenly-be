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
exports.InstitutionsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const institutions_mapper_1 = require("./institutions.mapper");
let InstitutionsService = class InstitutionsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async findOneMapped(id) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('institutions')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
        if (!data) {
            throw new common_1.NotFoundException(`Institusi ${id} tidak ditemukan`);
        }
        return (0, institutions_mapper_1.mapInstitutionRow)(data);
    }
    async updateMe(id, dto) {
        const patch = (0, institutions_mapper_1.patchMeToSnake)({ ...dto });
        if (Object.keys(patch).length === 0) {
            return this.findOneMapped(id);
        }
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('institutions')
            .update(patch)
            .eq('id', id)
            .select('*')
            .maybeSingle();
        if (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
        if (!data) {
            throw new common_1.NotFoundException(`Institusi ${id} tidak ditemukan`);
        }
        return (0, institutions_mapper_1.mapInstitutionRow)(data);
    }
    async findAllPage(page, limit) {
        const supabase = this.supabaseService.getClient();
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        const { data, error, count } = await supabase
            .from('institutions')
            .select('*', { count: 'exact' })
            .order('id', { ascending: true })
            .range(from, to);
        if (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
        const rows = (data ?? []);
        return {
            data: rows.map(institutions_mapper_1.mapInstitutionRow),
            meta: {
                page,
                limit,
                total: count ?? rows.length,
                totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
            },
        };
    }
    async create(dto) {
        const payload = (0, institutions_mapper_1.createDtoToSnake)({ ...dto });
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('institutions')
            .insert(payload)
            .select('*')
            .single();
        if (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
        return (0, institutions_mapper_1.mapInstitutionRow)(data);
    }
    async updateByAdmin(id, dto) {
        const patch = (0, institutions_mapper_1.patchAdminToSnake)({ ...dto });
        if (Object.keys(patch).length === 0) {
            return this.findOneMapped(id);
        }
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('institutions')
            .update(patch)
            .eq('id', id)
            .select('*')
            .maybeSingle();
        if (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
        if (!data) {
            throw new common_1.NotFoundException(`Institusi ${id} tidak ditemukan`);
        }
        return (0, institutions_mapper_1.mapInstitutionRow)(data);
    }
};
exports.InstitutionsService = InstitutionsService;
exports.InstitutionsService = InstitutionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], InstitutionsService);
//# sourceMappingURL=institutions.service.js.map