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
exports.KioskController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const kiosk_service_1 = require("./kiosk.service");
let KioskController = class KioskController {
    constructor(kioskService) {
        this.kioskService = kioskService;
    }
    async createSession(dto) {
        return { success: true, sessionId: 'ks-' + Date.now() };
    }
    async identify(embedding) {
        if (!embedding || embedding.length === 0) {
            throw new common_1.BadRequestException('Embedding tidak boleh kosong');
        }
        console.log('Embedding length:', embedding.length);
        const result = await this.kioskService.identifyFace(embedding);
        console.log('Identify result:', result);
        return result ?? {};
    }
    async scan(dto) {
        return this.kioskService.logAttendance(dto);
    }
    async exitKiosk(pin) {
        return this.kioskService.verifyExitPin(pin);
    }
    async getDailyStats() {
        return this.kioskService.getDailyStats();
    }
    async createNonce(institutionId) {
        return this.kioskService.createNonce(institutionId);
    }
};
exports.KioskController = KioskController;
__decorate([
    (0, common_1.Post)('sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Mulai sesi kiosk' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KioskController.prototype, "createSession", null);
__decorate([
    (0, common_1.Post)('identify'),
    (0, swagger_1.ApiOperation)({ summary: 'Identifikasi wajah → employeeId' }),
    __param(0, (0, common_1.Body)('embedding')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], KioskController.prototype, "identify", null);
__decorate([
    (0, common_1.Post)('scan'),
    (0, swagger_1.ApiOperation)({ summary: 'Catat scan ke attendance_logs (Check-in/OUT)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KioskController.prototype, "scan", null);
__decorate([
    (0, common_1.Post)('exit-request'),
    (0, swagger_1.ApiOperation)({ summary: 'Keluar mode kiosk (PIN)' }),
    __param(0, (0, common_1.Body)('pin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KioskController.prototype, "exitKiosk", null);
__decorate([
    (0, common_1.Get)('daily-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Dapatkan statistik harian untuk kiosk' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KioskController.prototype, "getDailyStats", null);
__decorate([
    (0, common_1.Post)('nonce'),
    (0, swagger_1.ApiOperation)({ summary: 'Minta nonce anti-replay' }),
    __param(0, (0, common_1.Body)('institutionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], KioskController.prototype, "createNonce", null);
exports.KioskController = KioskController = __decorate([
    (0, swagger_1.ApiTags)('kiosk'),
    (0, common_1.Controller)({ path: 'kiosk', version: '1' }),
    __metadata("design:paramtypes", [kiosk_service_1.KioskService])
], KioskController);
//# sourceMappingURL=kiosk.controller.js.map