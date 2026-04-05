import { SupabaseService } from '../../supabase/supabase.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
export declare class TenantBillingController {
    private readonly supabase;
    private readonly cloudinary;
    constructor(supabase: SupabaseService, cloudinary: CloudinaryService);
    getPlan(req: any): Promise<{
        plan: any;
        maxEmployees: any;
        expiresAt: any;
        activeEmployeeCount: number;
    }>;
    getPayments(req: any, limit?: number): Promise<{
        id: any;
        packageLabel: string;
        dateDisplay: string;
        amountDisplay: string;
        amount: any;
        transactionId: any;
        invoiceNumber: string;
        verificationStatus: any;
        paymentStatus: string;
        proofUrl: any;
    }[]>;
    submitPayment(req: any, dto: any): Promise<{
        success: boolean;
        message: string;
    }>;
    uploadProof(file: Express.Multer.File): Promise<{
        url: null;
        message: string;
    } | {
        url: string;
        message?: undefined;
    }>;
}
