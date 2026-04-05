import { SupabaseService } from '../../supabase/supabase.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
export declare class TenantEmployeesController {
    private readonly supabaseService;
    private readonly cloudinaryService;
    constructor(supabaseService: SupabaseService, cloudinaryService: CloudinaryService);
    getEmployees(req: any, query: any): Promise<{
        id: any;
        identifierId: any;
        name: any;
        email: any;
        jobTitle: any;
        department: any;
        faceEnrolled: any;
        joinedAtDate: any;
        initials: any;
        avatarColor: any;
        photoUrl: any;
        isActive: any;
    }[]>;
    createEmployee(req: any, dto: any): Promise<{
        success: boolean;
        employee: {
            id: any;
            identifierId: any;
            name: any;
            email: any;
            jobTitle: any;
            department: any;
            faceEnrolled: any;
            joinedAtDate: any;
            initials: any;
            avatarColor: any;
            photoUrl: any;
            isActive: any;
        };
    }>;
    getEmployee(req: any, id: string): Promise<{
        id: any;
        identifierId: any;
        name: any;
        email: any;
        jobTitle: any;
        department: any;
        faceEnrolled: any;
        joinedAtDate: any;
        initials: any;
        avatarColor: any;
        photoUrl: any;
        isActive: any;
    }>;
    updateEmployee(req: any, id: string, dto: any): Promise<{
        success: boolean;
        message: string;
        employee: {
            id: any;
            identifierId: any;
            name: any;
            email: any;
            jobTitle: any;
            department: any;
            faceEnrolled: any;
            joinedAtDate: any;
            initials: any;
            avatarColor: any;
            photoUrl: any;
            isActive: any;
        };
    }>;
    removeEmployee(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getEnrollment(req: any, id: string): Promise<{
        count: number;
        isReady: boolean;
    }>;
    addSingleFaceSample(req: any, id: string, body: {
        sample: any;
        sampleIndex: number;
        isFirst: boolean;
        isLast: boolean;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    resetFaceSamples(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
