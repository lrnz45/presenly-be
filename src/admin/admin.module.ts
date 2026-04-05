import { Module } from '@nestjs/common';
import { SuperadminOverviewController } from './overview/superadmin-overview.controller';
import { SuperadminInstitutionsController } from './institutions/superadmin-institutions.controller';
import { SuperadminPaymentsController } from './payments/superadmin-payments.controller';
import { SuperadminProfileController } from './profile/superadmin-profile.controller';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [AuthModule, SupabaseModule],
  controllers: [
    SuperadminOverviewController,
    SuperadminInstitutionsController,
    SuperadminPaymentsController,
    SuperadminProfileController,
  ],
})
export class AdminModule {}
