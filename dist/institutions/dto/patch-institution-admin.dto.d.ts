import { PatchInstitutionMeDto } from './patch-institution-me.dto';
export declare class PatchInstitutionAdminExtraDto {
    plan?: string;
    maxEmployees?: number;
    expiresAt?: string;
}
declare const PatchInstitutionAdminDto_base: import("@nestjs/common").Type<PatchInstitutionAdminExtraDto & Partial<PatchInstitutionMeDto>>;
export declare class PatchInstitutionAdminDto extends PatchInstitutionAdminDto_base {
}
export {};
