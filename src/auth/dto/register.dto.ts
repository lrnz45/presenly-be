import { ApiProperty } from '@nestjs/swagger';
import {
  Equals,
  IsEmail,
  IsIn,
  IsString,
  MinLength,
} from 'class-validator';

/** Selaras `RegisterInstitutionPayload` (frontend). */
export class RegisterDto {
  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @MinLength(2)
  registrantFullName: string;

  @ApiProperty({ example: 'SMA Negeri 1 Jakarta' })
  @IsString()
  @MinLength(2)
  institutionName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '081234567890' })
  @IsString()
  @MinLength(8)
  phone: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: ['sekolah', 'perusahaan'] })
  @IsIn(['sekolah', 'perusahaan'])
  category: 'sekolah' | 'perusahaan';

  @ApiProperty({ description: 'Wajib true untuk mendaftar' })
  @Equals(true, { message: 'termsAccepted harus true' })
  termsAccepted: boolean;
}
