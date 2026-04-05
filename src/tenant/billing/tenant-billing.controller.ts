import { Controller, Get, Post, Body, UseGuards, Request, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { SupabaseService } from '../../supabase/supabase.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@ApiTags('tenant-billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'tenant/billing', version: '1' })
export class TenantBillingController {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly cloudinary: CloudinaryService
  ) {}

  @Get('plan')
  @ApiOperation({ summary: 'Status paket, kuota, expires_at' })
  async getPlan(@Request() req: any) {
    const client = this.supabase.getClient();
    const instId = req.user.institutionId;

    // 1. Get Subscription Info
    const { data: inst } = await client
      .from('institutions')
      .select('plan, max_employees, expires_at, created_at')
      .eq('id', instId)
      .single();

    let plan = inst?.plan || 'free';
    let maxEmployees = inst?.max_employees || 15;
    let expiresAt = inst?.expires_at;

    // Ketentuan Landing Page untuk Paket FREE (Trial 30 hari, 25 Wajah)
    if (plan === 'free') {
      maxEmployees = 25;
      if (inst?.created_at) {
        const trialEndDate = new Date(inst.created_at);
        trialEndDate.setDate(trialEndDate.getDate() + 30);
        expiresAt = trialEndDate.toISOString();
      }
    }

    // 2. Count Active Employees
    const { count } = await client
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('institution_id', instId)
      .eq('status', 'active');

    return { 
      plan, 
      maxEmployees, 
      expiresAt, 
      activeEmployeeCount: count || 0 
    };
  }

  @Get('payments')
  @ApiOperation({ summary: 'Riwayat transaksi tenant' })
  async getPayments(@Request() req: any, @Query('limit') limit: number = 10) {
    const client = this.supabase.getClient();
    const instId = req.user.institutionId;

    const { data } = await client
      .from('payments')
      .select('*')
      .eq('institution_id', instId)
      .order('uploaded_at', { ascending: false })
      .limit(limit);

    return (data || []).map(p => ({
      id: p.id,
      packageLabel: `Paket ${(p.plan || 'basic').toUpperCase()}`,
      dateDisplay: new Date(p.uploaded_at || p.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      amountDisplay: `Rp ${Number(p.amount).toLocaleString('id-ID')}`,
      amount: p.amount,
      transactionId: p.id.toString().padStart(6, '0'),
      invoiceNumber: `INV-${p.id}`,
      verificationStatus: p.verification_status,
      paymentStatus: p.verification_status === 'approved' ? 'paid' : 'pending',
      proofUrl: p.proof_url
    }));
  }

  @Post('payments')
  @ApiOperation({ summary: 'Kirim bukti transfer' })
  async submitPayment(@Request() req: any, @Body() dto: any) {
    const client = this.supabase.getClient();
    const instId = req.user.institutionId;

    const { error } = await client.from('payments').insert({
      institution_id: instId,
      plan: dto.plan || 'basic',
      amount: dto.amount,
      proof_url: dto.proofUrl,
      verification_status: 'pending',
      payment_status: 'pending',
      uploaded_at: new Date().toISOString()
    });

    if (error) {
      console.error('[Billing SUBMIT Error]', error);
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Bukti pembayaran dikirim' };
  }

  @Post('uploads/proof')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Unggah file bukti' })
  async uploadProof(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { url: null, message: 'No file uploaded' };
    }
    
    const url = await this.cloudinary.uploadFile(file, 'payment_proofs');
    return { url };
  }
}
