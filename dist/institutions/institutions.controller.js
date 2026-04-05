"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstitutionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const req_institution_id_decorator_1 = require("../common/req-institution-id.decorator");
const create_institution_dto_1 = require("./dto/create-institution.dto");
const institution_response_dto_1 = require("./dto/institution-response.dto");
const list_institutions_query_dto_1 = require("./dto/list-institutions-query.dto");
const patch_institution_admin_dto_1 = require("./dto/patch-institution-admin.dto");
const patch_institution_me_dto_1 = require("./dto/patch-institution-me.dto");
const institutions_service_1 = require("./institutions.service");
let InstitutionsController = class InstitutionsController {
    constructor(institutionsService) {
        this.institutionsService = institutionsService;
    }
    async getMe(institutionId) {
        return this.institutionsService.findOneMapped(institutionId);
    }
    async patchMe(institutionId, dto) {
        return this.institutionsService.updateMe(institutionId, dto);
    }
    async list(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        return this.institutionsService.findAllPage(page, limit);
    }
    async create(dto) {
        return this.institutionsService.create(dto);
    }
    async getById(id) {
        return this.institutionsService.findOneMapped(id);
    }
    async patchById(id, dto) {
        return this.institutionsService.updateByAdmin(id, dto);
    }
};
exports.InstitutionsController = InstitutionsController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({
        operationId: 'inst_01_getMe',
        summary: 'Profil instansi tenant saat ini',
    }),
    (0, swagger_1.ApiSecurity)('institution-id'),
    (0, swagger_1.ApiHeader)({
        name: 'x-institution-id',
        required: true,
        description: 'ID institusi (sementara; nanti dari JWT)',
    }),
    (0, swagger_1.ApiOkResponse)({
        schema: { $ref: (0, swagger_1.getSchemaPath)(institution_response_dto_1.InstitutionResponseDto) },
    }),
    __param(0, (0, req_institution_id_decorator_1.ReqInstitutionId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InstitutionsController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, swagger_1.ApiOperation)({
        operationId: 'inst_02_patchMe',
        summary: 'Perbarui profil instansi (tanpa plan / maxEmployees / expiresAt)',
    }),
    (0, swagger_1.ApiSecurity)('institution-id'),
    (0, swagger_1.ApiHeader)({ name: 'x-institution-id', required: true }),
    (0, swagger_1.ApiOkResponse)({
        schema: { $ref: (0, swagger_1.getSchemaPath)(institution_response_dto_1.InstitutionResponseDto) },
    }),
    __param(0, (0, req_institution_id_decorator_1.ReqInstitutionId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, patch_institution_me_dto_1.PatchInstitutionMeDto]),
    __metadata("design:returntype", Promise)
], InstitutionsController.prototype, "patchMe", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        operationId: 'inst_03_list',
        summary: 'Daftar instansi (superadmin)',
    }),
    (0, swagger_1.ApiOkResponse)({
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { $ref: (0, swagger_1.getSchemaPath)(institution_response_dto_1.InstitutionResponseDto) },
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
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_institutions_query_dto_1.ListInstitutionsQueryDto]),
    __metadata("design:returntype", Promise)
], InstitutionsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        operationId: 'inst_04_create',
        summary: 'Buat instansi (superadmin)',
    }),
    (0, swagger_1.ApiOkResponse)({
        schema: { $ref: (0, swagger_1.getSchemaPath)(institution_response_dto_1.InstitutionResponseDto) },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_institution_dto_1.CreateInstitutionDto]),
    __metadata("design:returntype", Promise)
], InstitutionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        operationId: 'inst_05_getById',
        summary: 'Detail instansi by id (superadmin)',
    }),
    (0, swagger_1.ApiOkResponse)({
        schema: { $ref: (0, swagger_1.getSchemaPath)(institution_response_dto_1.InstitutionResponseDto) },
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InstitutionsController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        operationId: 'inst_06_patchById',
        summary: 'Perbarui instansi termasuk plan / kuota (superadmin)',
    }),
    (0, swagger_1.ApiOkResponse)({
        schema: { $ref: (0, swagger_1.getSchemaPath)(institution_response_dto_1.InstitutionResponseDto) },
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, patch_institution_admin_dto_1.PatchInstitutionAdminDto]),
    __metadata("design:returntype", Promise)
], InstitutionsController.prototype, "patchById", null);
exports.InstitutionsController = InstitutionsController = __decorate([
    (0, swagger_1.ApiTags)('institutions'),
    (0, swagger_1.ApiExtraModels)(institution_response_dto_1.InstitutionResponseDto),
    (0, common_1.Controller)({ path: 'institutions', version: '1' }),
    __metadata("design:paramtypes", [institutions_service_1.InstitutionsService])
], InstitutionsController);
//# sourceMappingURL=institutions.controller.js.map