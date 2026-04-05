import { SupabaseService } from '../../supabase/supabase.service';
export declare class SuperadminInstitutionsController {
    private readonly supabase;
    constructor(supabase: SupabaseService);
    getAll(query: any): Promise<{
        id: any;
        name: any;
        categoryLabel: any;
        plan: any;
        memberCount: number;
        maxEmployees: any;
        expiresAt: any;
        subscriptionHealth: string;
        initials: any;
    }[]>;
    create(dto: any): Promise<{
        success: boolean;
        data: any;
    }>;
    getOne(id: string): Promise<any>;
    update(id: string, dto: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getEmployees(id: string, query: any): Promise<{
        id: number;
        name: string;
    }[]>;
    getPayments(id: string, query: any): Promise<{
        id: number;
        amount: number;
        date: string;
    }[]>;
}
