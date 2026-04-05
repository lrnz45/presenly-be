export declare class InstitutionResponseDto {
    id: number;
    name: string;
    category: string;
    address: string | null;
    timezone: string | null;
    contactEmail: string | null;
    phone: string | null;
    initials: string | null;
    attendanceMode: string | null;
    checkInTime: string | null;
    checkOutTime: string | null;
    lateToleranceMinutes: number | null;
    activeWeekdays: string[] | null;
    kioskPin: string | null;
    plan: string | null;
    maxEmployees: number | null;
    expiresAt: string | null;
    createdAt: string | null;
}
