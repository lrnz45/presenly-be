import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { KioskService } from './kiosk.service';

@ApiTags('kiosk')
@Controller({ path: 'kiosk', version: '1' })
export class KioskController {
  constructor(private readonly kioskService: KioskService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Mulai sesi kiosk' })
  async createSession(@Body() dto: any) {
    return { success: true, sessionId: 'ks-' + Date.now() };
  }

  @Post('identify')
  @ApiOperation({ summary: 'Identifikasi wajah → employeeId' })
  async identify(@Body('embedding') embedding: number[]) {
    if (!embedding || embedding.length === 0) {
      throw new BadRequestException('Embedding tidak boleh kosong');
    }

    console.log('Embedding length:', embedding.length); // cek dimensi
    const result = await this.kioskService.identifyFace(embedding);
    console.log('Identify result:', result); // cek output
    return result ?? {}; // ← jangan return null mentah, return {} agar tidak loading terus
  }

  @Post('scan')
  @ApiOperation({ summary: 'Catat scan ke attendance_logs (Check-in/OUT)' })
  async scan(@Body() dto: any) {
    return this.kioskService.logAttendance(dto);
  }

  @Post('exit-request')
  @ApiOperation({ summary: 'Keluar mode kiosk (PIN)' })
  async exitKiosk(@Body('pin') pin: string) {
    return this.kioskService.verifyExitPin(pin);
  }

  @Get('daily-stats')
  @ApiOperation({ summary: 'Dapatkan statistik harian untuk kiosk' })
  async getDailyStats() {
    return this.kioskService.getDailyStats();
  }

  @Post('nonce')
  @ApiOperation({ summary: 'Minta nonce anti-replay' })
  async createNonce(@Body('institutionId') institutionId?: number) {
    return this.kioskService.createNonce(institutionId);
  }
}
