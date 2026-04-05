import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty()
  adminId: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ enum: ['admin', 'superadmin'] })
  role: string;

  @ApiPropertyOptional({ nullable: true, description: 'null untuk superadmin root' })
  institutionId: number | null;

  @ApiPropertyOptional({ nullable: true })
  googleId: string | null;
}

export class AuthTokensDto {
  @ApiProperty({ description: 'Gunakan di header Authorization: Bearer <accessToken>' })
  accessToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ example: 604800, description: 'Kadaluarsa access token (detik)' })
  expiresIn: number;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}
