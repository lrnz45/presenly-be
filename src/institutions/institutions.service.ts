import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  createDtoToSnake,
  InstitutionRow,
  mapInstitutionRow,
  patchAdminToSnake,
  patchMeToSnake,
  type InstitutionResponse,
} from './institutions.mapper';
import type { CreateInstitutionDto } from './dto/create-institution.dto';
import type { PatchInstitutionMeDto } from './dto/patch-institution-me.dto';
import type { PatchInstitutionAdminDto } from './dto/patch-institution-admin.dto';

@Injectable()
export class InstitutionsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findOneMapped(id: number): Promise<InstitutionResponse> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!data) {
      throw new NotFoundException(`Institusi ${id} tidak ditemukan`);
    }
    return mapInstitutionRow(data as InstitutionRow);
  }

  async updateMe(
    id: number,
    dto: PatchInstitutionMeDto,
  ): Promise<InstitutionResponse> {
    const patch = patchMeToSnake({ ...dto } as Record<string, unknown>);
    if (Object.keys(patch).length === 0) {
      return this.findOneMapped(id);
    }
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('institutions')
      .update(patch)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!data) {
      throw new NotFoundException(`Institusi ${id} tidak ditemukan`);
    }
    return mapInstitutionRow(data as InstitutionRow);
  }

  async findAllPage(page: number, limit: number) {
    const supabase = this.supabaseService.getClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('institutions')
      .select('*', { count: 'exact' })
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const rows = (data ?? []) as InstitutionRow[];
    return {
      data: rows.map(mapInstitutionRow),
      meta: {
        page,
        limit,
        total: count ?? rows.length,
        totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
      },
    };
  }

  async create(dto: CreateInstitutionDto): Promise<InstitutionResponse> {
    const payload = createDtoToSnake({ ...dto } as Record<string, unknown>);
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('institutions')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return mapInstitutionRow(data as InstitutionRow);
  }

  async updateByAdmin(
    id: number,
    dto: PatchInstitutionAdminDto,
  ): Promise<InstitutionResponse> {
    const patch = patchAdminToSnake({ ...dto } as Record<string, unknown>);
    if (Object.keys(patch).length === 0) {
      return this.findOneMapped(id);
    }
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('institutions')
      .update(patch)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!data) {
      throw new NotFoundException(`Institusi ${id} tidak ditemukan`);
    }
    return mapInstitutionRow(data as InstitutionRow);
  }
}
