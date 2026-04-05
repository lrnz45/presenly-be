import { ApiPropertyOptional, IntersectionType, PartialType } from '@nestjs/swagger';
import { PatchInstitutionMeDto } from './patch-institution-me.dto';
import { IsIn, IsInt, IsISO8601, IsOptional, Max, Min } from 'class-validator';

/** Field superadmin tambahan di atas patch tenant. */
export class PatchInstitutionAdminExtraDto {
  @ApiPropertyOptional({ enum: ['free', 'basic', 'premium'] })
  @IsOptional()
  @IsIn(['free', 'basic', 'premium'])
  plan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999999)
  maxEmployees?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}

/** Gabungan partial: semua field institutions bisa di-patch oleh superadmin. */
export class PatchInstitutionAdminDto extends IntersectionType(
  PartialType(PatchInstitutionMeDto),
  PatchInstitutionAdminExtraDto,
) {}
