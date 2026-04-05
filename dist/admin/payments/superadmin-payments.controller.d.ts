import { SupabaseService } from '../../supabase/supabase.service';
export declare class SuperadminPaymentsController {
    private readonly supabase;
    constructor(supabase: SupabaseService);
    getAll(query: any): Promise<{
        id: any;
        institutionId: any;
        tenantName: any;
        categoryLabel: any;
        tenantInitials: any;
        plan: any;
        amount: number;
        amountDisplay: string;
        uploadedAtDisplay: string;
        transactionId: any;
        invoiceNumber: any;
        verificationStatus: any;
        paymentStatus: any;
        proofUrl: any;
    }[]>;
    getOne(id: string): Promise<any>;
    approve(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    reject(id: string, dto: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
