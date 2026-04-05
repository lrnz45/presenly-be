import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

/** Tukar Google ID token / access token menjadi JWT aplikasi. */
export class GoogleAuthDto {
  @ApiProperty({
    description:
      'ID token JWT dari Google Sign-In (web/mobile). Disarankan dibanding access_token.',
  })
  @IsString()
  @MinLength(20)
  idToken: string;

  @ApiPropertyOptional({
    description: 'Opsional: override audience verifikasi (default dari GOOGLE_CLIENT_ID)',
  })
  @IsOptional()
  @IsString()
  audience?: string;
}
