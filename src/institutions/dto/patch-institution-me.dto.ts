import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class PatchInstitutionMeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ enum: ['sekolah', 'perusahaan'] })
  @IsOptional()
  @IsIn(['sekolah', 'perusahaan'])
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ enum: ['WIB', 'WITA', 'WIT'] })
  @IsOptional()
  @IsIn(['WIB', 'WITA', 'WIT'])
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  initials?: string;

  @ApiPropertyOptional({ enum: ['both', 'in_only'] })
  @IsOptional()
  @IsIn(['both', 'in_only'])
  attendanceMode?: string;

  @ApiPropertyOptional({ description: 'Format HH:mm atau HH:mm:ss' })
  @IsOptional()
  @IsString()
  checkInTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  checkOutTime?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 120 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  lateToleranceMinutes?: number;

  @ApiPropertyOptional({ type: [String], example: ['sen', 'sel', 'rab', 'kam', 'jum'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  activeWeekdays?: string[];

  @ApiPropertyOptional({ description: 'PIN 6 digit' })
  @IsOptional()
  @IsString()
  kioskPin?: string;
}
