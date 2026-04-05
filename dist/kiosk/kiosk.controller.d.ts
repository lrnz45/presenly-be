import { KioskService } from './kiosk.service';
export declare class KioskController {
    private readonly kioskService;
    constructor(kioskService: KioskService);
    createSession(dto: any): Promise<{
        success: boolean;
        sessionId: string;
    }>;
    identify(embedding: number[]): Promise<{
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
    scan(dto: any): Promise<{
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
    exitKiosk(pin: string): Promise<{
        success: boolean;
    }>;
    getDailyStats(): Promise<{
        total: number;
        late: number;
        rate: number;
        missing: number;
        employeeTotal: number;
    }>;
    createNonce(institutionId?: number): Promise<{
        nonce: string;
    }>;
}
