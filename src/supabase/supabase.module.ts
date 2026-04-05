// src/supabase/supabase.module.ts
import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Module({
  providers: [SupabaseService],
  exports: [SupabaseService], // Penting: Ekspor agar bisa di-inject di controller/service lain
})
export class SupabaseModule {}