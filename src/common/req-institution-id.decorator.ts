import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

/**
 * Membaca header `x-institution-id` (sementara sampai JWT membawa institution_id).
 */
export const ReqInstitutionId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const req = ctx.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const raw = req.headers['x-institution-id'];
    const str = Array.isArray(raw) ? raw[0] : raw;
    const id = parseInt(String(str), 10);
    if (str === undefined || str === '' || Number.isNaN(id) || id < 1) {
      throw new BadRequestException(
        'Header X-Institution-Id wajib ada dan harus berupa angka positif',
      );
    }
    return id;
  },
);
