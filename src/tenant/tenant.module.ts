import { Module } from '@nestjs/common';
import { TenantDashboardController } from './dashboard/tenant-dashboard.controller';
import { TenantInstitutionController } from './institution/tenant-institution.controller';
import { TenantProfileController } from './profile/tenant-profile.controller';
import { TenantEmployeesController } from './employees/tenant-employees.controller';
import { TenantAttendanceController } from './attendance/tenant-attendance.controller';
import { TenantBillingController } from './billing/tenant-billing.controller';
import { AuthModule } from '../auth/auth.module';
import { SupabaseService } from 'src/supabase/supabase.service';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [AuthModule, SupabaseModule],
  controllers: [
    TenantDashboardController,
    TenantInstitutionController,
    TenantProfileController,
    TenantEmployeesController,
    TenantAttendanceController,
    TenantBillingController,
  ],
  providers: [CloudinaryService],
})
export class TenantModule {}
