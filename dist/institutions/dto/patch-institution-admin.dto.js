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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatchInstitutionAdminDto = exports.PatchInstitutionAdminExtraDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const patch_institution_me_dto_1 = require("./patch-institution-me.dto");
const class_validator_1 = require("class-validator");
class PatchInstitutionAdminExtraDto {
}
exports.PatchInstitutionAdminExtraDto = PatchInstitutionAdminExtraDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['free', 'basic', 'premium'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['free', 'basic', 'premium']),
    __metadata("design:type", String)
], PatchInstitutionAdminExtraDto.prototype, "plan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(999999),
    __metadata("design:type", Number)
], PatchInstitutionAdminExtraDto.prototype, "maxEmployees", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], PatchInstitutionAdminExtraDto.prototype, "expiresAt", void 0);
class PatchInstitutionAdminDto extends (0, swagger_1.IntersectionType)((0, swagger_1.PartialType)(patch_institution_me_dto_1.PatchInstitutionMeDto), PatchInstitutionAdminExtraDto) {
}
exports.PatchInstitutionAdminDto = PatchInstitutionAdminDto;
//# sourceMappingURL=patch-institution-admin.dto.js.map