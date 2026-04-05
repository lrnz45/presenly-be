import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ReqInstitutionId } from '../common/req-institution-id.decorator';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { InstitutionResponseDto } from './dto/institution-response.dto';
import { ListInstitutionsQueryDto } from './dto/list-institutions-query.dto';
import { PatchInstitutionAdminDto } from './dto/patch-institution-admin.dto';
import { PatchInstitutionMeDto } from './dto/patch-institution-me.dto';
import { InstitutionsService } from './institutions.service';

@ApiTags('institutions')
@ApiExtraModels(InstitutionResponseDto)
@Controller({ path: 'institutions', version: '1' })
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get('me')
  @ApiOperation({
    operationId: 'inst_01_getMe',
    summary: 'Profil instansi tenant saat ini',
  })
  @ApiSecurity('institution-id')
  @ApiHeader({
    name: 'x-institution-id',
    required: true,
    description: 'ID institusi (sementara; nanti dari JWT)',
  })
  @ApiOkResponse({
    schema: { $ref: getSchemaPath(InstitutionResponseDto) },
  })
  async getMe(@ReqInstitutionId() institutionId: number) {
    return this.institutionsService.findOneMapped(institutionId);
  }

  @Patch('me')
  @ApiOperation({
    operationId: 'inst_02_patchMe',
    summary: 'Perbarui profil instansi (tanpa plan / maxEmployees / expiresAt)',
  })
  @ApiSecurity('institution-id')
  @ApiHeader({ name: 'x-institution-id', required: true })
  @ApiOkResponse({
    schema: { $ref: getSchemaPath(InstitutionResponseDto) },
  })
  async patchMe(
    @ReqInstitutionId() institutionId: number,
    @Body() dto: PatchInstitutionMeDto,
  ) {
    return this.institutionsService.updateMe(institutionId, dto);
  }

  @Get()
  @ApiOperation({
    operationId: 'inst_03_list',
    summary: 'Daftar instansi (superadmin)',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(InstitutionResponseDto) },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  async list(@Query() query: ListInstitutionsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return this.institutionsService.findAllPage(page, limit);
  }

  @Post()
  @ApiOperation({
    operationId: 'inst_04_create',
    summary: 'Buat instansi (superadmin)',
  })
  @ApiOkResponse({
    schema: { $ref: getSchemaPath(InstitutionResponseDto) },
  })
  async create(@Body() dto: CreateInstitutionDto) {
    return this.institutionsService.create(dto);
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'inst_05_getById',
    summary: 'Detail instansi by id (superadmin)',
  })
  @ApiOkResponse({
    schema: { $ref: getSchemaPath(InstitutionResponseDto) },
  })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.institutionsService.findOneMapped(id);
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'inst_06_patchById',
    summary: 'Perbarui instansi termasuk plan / kuota (superadmin)',
  })
  @ApiOkResponse({
    schema: { $ref: getSchemaPath(InstitutionResponseDto) },
  })
  async patchById(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PatchInstitutionAdminDto,
  ) {
    return this.institutionsService.updateByAdmin(id, dto);
  }
}
