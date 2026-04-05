import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateInstitutionDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ enum: ['sekolah', 'perusahaan'] })
  @IsIn(['sekolah', 'perusahaan'])
  category: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ enum: ['WIB', 'WITA', 'WIT'], default: 'WIB' })
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

  @ApiPropertyOptional({ enum: ['free', 'basic', 'premium'], default: 'free' })
  @IsOptional()
  @IsIn(['free', 'basic', 'premium'])
  plan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999999)
  maxEmployees?: number;

  @ApiProperty({ description: 'ISO 8601, wajib di DB' })
  @IsISO8601()
  expiresAt: string;

  @ApiProperty({ description: 'TIME masuk kerja, mis. 07:00:00' })
  @IsString()
  checkInTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  checkOutTime?: string;

  @ApiPropertyOptional({ enum: ['both', 'in_only'] })
  @IsOptional()
  @IsIn(['both', 'in_only'])
  attendanceMode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  lateToleranceMinutes?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  activeWeekdays?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kioskPin?: string;

  @ApiPropertyOptional({ description: 'Email admin utama (alur undangan terpisah)' })
  @IsOptional()
  @IsString()
  primaryAdminEmail?: string;
}
