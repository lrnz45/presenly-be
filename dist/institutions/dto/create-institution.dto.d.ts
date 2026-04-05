export declare class CreateInstitutionDto {
    name: string;
    category: string;
    address?: string;
    timezone?: string;
    contactEmail?: string;
    phone?: string;
    initials?: string;
    plan?: string;
    maxEmployees?: number;
    expiresAt: string;
    checkInTime: string;
    checkOutTime?: string;
    attendanceMode?: string;
    lateToleranceMinutes?: number;
    activeWeekdays?: string[];
    kioskPin?: string;
    primaryAdminEmail?: string;
}
