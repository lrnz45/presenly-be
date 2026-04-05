export declare class TenantInstitutionController {
    getInstitution(req: any): Promise<{
        institutionName: string;
        category: string;
        address: string;
        timezone: string;
        contactEmail: string;
        phone: string;
        attendanceMode: string;
        checkInTime: string;
        checkOutTime: string;
        lateToleranceMinutes: number;
        activeWeekdays: string[];
    }>;
    updateInstitution(req: any, dto: any): Promise<{
        success: boolean;
        message: string;
    }>;
    updateKioskPin(req: any, pin: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAdmins(req: any): Promise<{
        id: number;
        fullName: string;
        email: string;
        phoneNumber: string;
        role: string;
        initials: string;
        color: string;
        avatarUrl: null;
    }[]>;
    inviteAdmin(req: any, email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    removeAdmin(req: any, adminId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
