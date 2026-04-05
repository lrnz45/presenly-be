import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InstitutionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['sekolah', 'perusahaan'] })
  category: string;

  @ApiPropertyOptional({ nullable: true })
  address: string | null;

  @ApiPropertyOptional({ nullable: true })
  timezone: string | null;

  @ApiPropertyOptional({ nullable: true })
  contactEmail: string | null;

  @ApiPropertyOptional({ nullable: true })
  phone: string | null;

  @ApiPropertyOptional({ nullable: true })
  initials: string | null;

  @ApiPropertyOptional({ enum: ['both', 'in_only'], nullable: true })
  attendanceMode: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'TIME → string "HH:mm:ss"' })
  checkInTime: string | null;

  @ApiPropertyOptional({ nullable: true })
  checkOutTime: string | null;

  @ApiPropertyOptional({ nullable: true })
  lateToleranceMinutes: number | null;

  @ApiPropertyOptional({ type: [String], nullable: true })
  activeWeekdays: string[] | null;

  @ApiPropertyOptional({ nullable: true })
  kioskPin: string | null;

  @ApiPropertyOptional({ enum: ['free', 'basic', 'premium'], nullable: true })
  plan: string | null;

  @ApiPropertyOptional({ nullable: true })
  maxEmployees: number | null;

  @ApiPropertyOptional({ nullable: true })
  expiresAt: string | null;

  @ApiPropertyOptional({ nullable: true })
  createdAt: string | null;
}
