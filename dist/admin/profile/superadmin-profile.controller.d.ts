export declare class SuperadminProfileController {
    getProfile(req: any): Promise<{
        displayName: string;
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
