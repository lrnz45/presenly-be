import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Login dengan pasangan email+password **atau** hanya `googleId` (akun sudah terhubung Google).
 */
export class LoginDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    description: 'Google `sub` (user id) jika sudah pernah ditautkan ke akun',
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  googleId?: string;
}
