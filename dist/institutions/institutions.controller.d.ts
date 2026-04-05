import { CreateInstitutionDto } from './dto/create-institution.dto';
import { ListInstitutionsQueryDto } from './dto/list-institutions-query.dto';
import { PatchInstitutionAdminDto } from './dto/patch-institution-admin.dto';
import { PatchInstitutionMeDto } from './dto/patch-institution-me.dto';
import { InstitutionsService } from './institutions.service';
export declare class InstitutionsController {
    private readonly institutionsService;
    constructor(institutionsService: InstitutionsService);
    getMe(institutionId: number): Promise<import("./institutions.mapper").InstitutionResponse>;
    patchMe(institutionId: number, dto: PatchInstitutionMeDto): Promise<import("./institutions.mapper").InstitutionResponse>;
    list(query: ListInstitutionsQueryDto): Promise<{
        data: import("./institutions.mapper").InstitutionResponse[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    create(dto: CreateInstitutionDto): Promise<import("./institutions.mapper").InstitutionResponse>;
    getById(id: number): Promise<import("./institutions.mapper").InstitutionResponse>;
    patchById(id: number, dto: PatchInstitutionAdminDto): Promise<import("./institutions.mapper").InstitutionResponse>;
}
