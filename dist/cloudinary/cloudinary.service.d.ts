export declare class CloudinaryService {
    constructor();
    uploadImageBase64(fileBase64: string, folderName?: string): Promise<string>;
    uploadFile(file: Express.Multer.File, folderName?: string): Promise<string>;
}
