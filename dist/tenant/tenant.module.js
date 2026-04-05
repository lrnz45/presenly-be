"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantModule = void 0;
const common_1 = require("@nestjs/common");
const tenant_dashboard_controller_1 = require("./dashboard/tenant-dashboard.controller");
const tenant_institution_controller_1 = require("./institution/tenant-institution.controller");
const tenant_profile_controller_1 = require("./profile/tenant-profile.controller");
const tenant_employees_controller_1 = require("./employees/tenant-employees.controller");
const tenant_attendance_controller_1 = require("./attendance/tenant-attendance.controller");
const tenant_billing_controller_1 = require("./billing/tenant-billing.controller");
const auth_module_1 = require("../auth/auth.module");
const supabase_module_1 = require("../supabase/supabase.module");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let TenantModule = class TenantModule {
};
exports.TenantModule = TenantModule;
exports.TenantModule = TenantModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, supabase_module_1.SupabaseModule],
        controllers: [
            tenant_dashboard_controller_1.TenantDashboardController,
            tenant_institution_controller_1.TenantInstitutionController,
            tenant_profile_controller_1.TenantProfileController,
            tenant_employees_controller_1.TenantEmployeesController,
            tenant_attendance_controller_1.TenantAttendanceController,
            tenant_billing_controller_1.TenantBillingController,
        ],
        providers: [cloudinary_service_1.CloudinaryService],
    })
], TenantModule);
//# sourceMappingURL=tenant.module.js.map