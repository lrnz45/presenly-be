import { Module } from '@nestjs/common';
import { TenantDashboardController } from './tenant-dashboard.controller';
import { AuthModule } from '../../auth/auth.module';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [AuthModule, SupabaseModule],
  controllers: [TenantDashboardController],
})
export class TenantDashboardModule {}
