import { SupabaseService } from '../../supabase/supabase.service';
export declare class TenantAttendanceController {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    getCalendar(req: any, query: any): Promise<{
        employees: {
            id: any;
            name: any;
            initials: any;
            avatar_color: any;
        }[];
        attendance: {};
    } | {
        employees: {
            id: any;
            name: any;
            initials: any;
            avatarColor: any;
        }[];
        attendance: {};
    }>;
    getLogs(query: any): Promise<{
        id: any;
        staffName: any;
        subtitle: any;
        photoUrl: any;
        checkInDisplay: string;
        status: string;
        scanType: any;
    }[]>;
    getDailyRecord(id: string): Promise<{
        id: string;
        dayCode: string;
        checkInTime: string;
    }>;
    updateDailyRecord(id: string, dto: any): Promise<{
        success: boolean;
    }>;
    upsertDailyRecord(dto: any): Promise<{
        success: boolean;
        id: number;
    }>;
    deleteDailyRecord(employeeId: string, recordDate: string): Promise<{
        success: boolean;
    }>;
    exportExcel(query: any): Promise<{
        url: string;
    }>;
    exportPdf(query: any): Promise<{
        url: string;
    }>;
}
