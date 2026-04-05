import { Controller, Get, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { SupabaseService } from '../../supabase/supabase.service';

@ApiTags('superadmin-payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'admin/payments', version: '1' })
export class SuperadminPaymentsController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar transaksi tertunda / sukses (platform)' })
  async getAll(@Query() query: any) {
    const client = this.supabase.getClient();
    
    let q = client.from('payments').select('*, institutions(name, initials, category)');
    
    if (query.status) {
      q = q.eq('verification_status', query.status);
    }
    
    const { data: pays } = await q.order('uploaded_at', { ascending: false });

    return (pays || []).map(p => ({
      id: p.id,
      institutionId: p.institution_id,
      tenantName: (p.institutions as any)?.name || 'Unknown',
      categoryLabel: (p.institutions as any)?.category || 'General',
      tenantInitials: (p.institutions as any)?.initials || '??',
      plan: p.plan.toUpperCase(),
      amount: Number(p.amount),
      amountDisplay: `Rp ${Number(p.amount).toLocaleString('id-ID')}`,
      uploadedAtDisplay: new Date(p.uploaded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      transactionId: p.transaction_id,
      invoiceNumber: p.invoice_number,
      verificationStatus: p.verification_status,
      paymentStatus: p.payment_status,
      proofUrl: p.proof_url
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail transaksi + bukti' })
  async getOne(@Param('id') id: string) {
    const client = this.supabase.getClient();
    const { data } = await client
      .from('payments')
      .select('*, institutions(name, contact_email)')
      .eq('id', id)
      .single();
    
    return data;
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Setujui pembayaran' })
  async approve(@Param('id') id: string) {
    const client = this.supabase.getClient();
    
    // 1. Get payment details
    const { data: pay } = await client
      .from('payments')
      .select('institution_id, plan, amount')
      .eq('id', id)
      .single();
    
    if (!pay) throw new Error('Pembayaran tidak ditemukan');

    // 2. Calculate new expiry date (+30 days from now)
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 30);

    // 3. Define max employees based on plan
    const maxEmps = pay.plan === 'premium' ? 2000 : 200; // Premium = unlimited logic, Basic = 200

    // 4. Update Institution
    await client
      .from('institutions')
      .update({ 
        plan: pay.plan, 
        expires_at: newExpiry.toISOString(),
        max_employees: maxEmps
      })
      .eq('id', pay.institution_id);

    // 5. Update payment status
    const { error } = await client
      .from('payments')
      .update({ 
        verification_status: 'approved', 
        payment_status: 'paid',
        approved_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    return { success: true, message: 'Pembayaran disetujui, paket diperbarui' };
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Tolak pembayaran' })
  async reject(@Param('id') id: string, @Body() dto: any) {
    const client = this.supabase.getClient();
    
    const { error } = await client
      .from('payments')
      .update({ 
        verification_status: 'rejected',
        payment_status: 'pending' // Tetap pending karena belum bayar/gagal
      })
      .eq('id', id);

    if (error) throw error;
    return { success: true, message: 'Pembayaran ditolak' };
  }
}
