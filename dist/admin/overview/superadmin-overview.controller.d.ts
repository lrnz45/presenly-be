import { SupabaseService } from '../../supabase/supabase.service';
export declare class SuperadminOverviewController {
    private readonly supabase;
    constructor(supabase: SupabaseService);
    getStats(): Promise<{
        label: string;
        value: string;
        bg: string;
        icon: string;
    }[]>;
    getScanChart(range?: string): Promise<any[]>;
    getRecent(limit?: number): Promise<{
        id: any;
        name: any;
        plan: any;
        initials: any;
        memberCount: number;
    }[]>;
}
