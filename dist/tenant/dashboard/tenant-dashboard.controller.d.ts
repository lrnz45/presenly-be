import { SupabaseService } from '../../supabase/supabase.service';
export declare class TenantDashboardController {
    private readonly supabase;
    constructor(supabase: SupabaseService);
    getSummary(req: any, date?: string): Promise<{
        label: string;
        value: string;
        iconBgClass: string;
        icon: string;
    }[]>;
    getChart(req: any, range?: string): Promise<any[]>;
    getLiveScans(req: any, limit?: number): Promise<{
        id: any;
        name: any;
        terminalLabel: string;
        timeDisplay: string;
        matchLabel: string;
        presence: string;
    }[]>;
    getEarlyArrivals(req: any, limit?: number): Promise<{
        id: any;
        fullName: any;
        employeeCode: any;
        scannedAt: any;
    }[]>;
}
