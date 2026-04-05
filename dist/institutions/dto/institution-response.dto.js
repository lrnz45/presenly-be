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
exports.InstitutionResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class InstitutionResponseDto {
}
exports.InstitutionResponseDto = InstitutionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], InstitutionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InstitutionResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['sekolah', 'perusahaan'] }),
    __metadata("design:type", String)
], InstitutionResponseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], InstitutionResponseDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], InstitutionResponseDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], InstitutionResponseDto.prototype, "contactEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], InstitutionResponseDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], InstitutionResponseDto.prototype, "initials", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['both', 'in_only'], nullable: true }),
    __metadata("design:type", Object)
], InstitutionResponseDto.prototype, "attendanceMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true, description: 'TIME → string "HH:mm:ss"' }),
    __metadata("design:type", Object)
], InstitutionResponseDto.prototype, "checkInTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], InstitutionResponseDto.prototype, "checkOutTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], InstitutionResponseDto.prototype, "lateToleranceMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], nullable: true }),
    __metadata("design:type", Object)
], InstitutionResponseDto.prototype, "activeWeekdays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], InstitutionResponseDto.prototype, "kioskPin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['free', 'basic', 'premium'], nullable: true }),
    __metadata("design:type", Object)
], InstitutionResponseDto.prototype, "plan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], InstitutionResponseDto.prototype, "maxEmployees", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], InstitutionResponseDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], InstitutionResponseDto.prototype, "createdAt", void 0);
//# sourceMappingURL=institution-response.dto.js.map