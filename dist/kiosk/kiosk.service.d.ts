import { SupabaseService } from '../supabase/supabase.service';
export declare class KioskService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    identifyFace(embedding: number[]): Promise<{
        success: boolean;
        message?: undefined;
        employeeId?: undefined;
        institutionId?: undefined;
        name?: undefined;
        subtitle?: undefined;
        photoUrl?: undefined;
        confidence?: undefined;
    } | {
        success: boolean;
        message: string;
        employeeId?: undefined;
        institutionId?: undefined;
        name?: undefined;
        subtitle?: undefined;
        photoUrl?: undefined;
        confidence?: undefined;
    } | {
        success: boolean;
        employeeId: any;
        institutionId: any;
        name: any;
        subtitle: any;
        photoUrl: any;
        confidence: number;
        message?: undefined;
    }>;
    logAttendance(dto: {
        employeeId: number;
        scanType: string;
        confidence: number;
        nonce?: string;
    }): Promise<{
        id: any;
        skip: boolean;
        timeDisplay?: undefined;
        punctualityLabel?: undefined;
    } | {
        id: any;
        timeDisplay: string;
        punctualityLabel: string;
        skip?: undefined;
    }>;
    verifyExitPin(pin: string): Promise<{
        success: boolean;
    }>;
    getDailyStats(): Promise<{
        total: number;
        late: number;
        rate: number;
        missing: number;
        employeeTotal: number;
    }>;
    getAttendanceLogs(): Promise<{
        id: any;
        staffName: any;
        subtitle: any;
        checkInDisplay: string;
        status: string;
        scanType: any;
    }[]>;
    createNonce(institutionId?: number): Promise<{
        nonce: string;
    }>;
}
