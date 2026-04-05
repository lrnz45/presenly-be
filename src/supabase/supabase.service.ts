// src/supabase/supabase.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private clientInstance: SupabaseClient;

  constructor(private readonly configService: ConfigService) {}

  // Method untuk mendapatkan instance client
  getClient() {
    if (this.clientInstance) {
      return this.clientInstance;
    }

    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or Key is missing in environment variables');
    }

    this.clientInstance = createClient(supabaseUrl, supabaseKey);
    return this.clientInstance;
  }
}