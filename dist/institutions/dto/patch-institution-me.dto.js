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
exports.PatchInstitutionMeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class PatchInstitutionMeDto {
}
exports.PatchInstitutionMeDto = PatchInstitutionMeDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], PatchInstitutionMeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['sekolah', 'perusahaan'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['sekolah', 'perusahaan']),
    __metadata("design:type", String)
], PatchInstitutionMeDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchInstitutionMeDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['WIB', 'WITA', 'WIT'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['WIB', 'WITA', 'WIT']),
    __metadata("design:type", String)
], PatchInstitutionMeDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchInstitutionMeDto.prototype, "contactEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchInstitutionMeDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchInstitutionMeDto.prototype, "initials", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['both', 'in_only'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['both', 'in_only']),
    __metadata("design:type", String)
], PatchInstitutionMeDto.prototype, "attendanceMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Format HH:mm atau HH:mm:ss' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchInstitutionMeDto.prototype, "checkInTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchInstitutionMeDto.prototype, "checkOutTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 120 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(120),
    __metadata("design:type", Number)
], PatchInstitutionMeDto.prototype, "lateToleranceMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['sen', 'sel', 'rab', 'kam', 'jum'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], PatchInstitutionMeDto.prototype, "activeWeekdays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'PIN 6 digit' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchInstitutionMeDto.prototype, "kioskPin", void 0);
//# sourceMappingURL=patch-institution-me.dto.js.map