import { SupabaseService } from '../supabase/supabase.service';
import { type InstitutionResponse } from './institutions.mapper';
import type { CreateInstitutionDto } from './dto/create-institution.dto';
import type { PatchInstitutionMeDto } from './dto/patch-institution-me.dto';
import type { PatchInstitutionAdminDto } from './dto/patch-institution-admin.dto';
export declare class InstitutionsService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    findOneMapped(id: number): Promise<InstitutionResponse>;
    updateMe(id: number, dto: PatchInstitutionMeDto): Promise<InstitutionResponse>;
    findAllPage(page: number, limit: number): Promise<{
        data: InstitutionResponse[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    create(dto: CreateInstitutionDto): Promise<InstitutionResponse>;
    updateByAdmin(id: number, dto: PatchInstitutionAdminDto): Promise<InstitutionResponse>;
}
