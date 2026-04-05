export declare class TenantProfileController {
    getProfile(req: any): Promise<{
        displayName: string;
        accountRoleLabel: string;
        email: any;
        phoneNumber: string;
        avatarUrl: null;
    }>;
    updateProfile(req: any, dto: any): Promise<{
        success: boolean;
        message: string;
    }>;
    updatePassword(req: any, dto: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
