export declare class AuthUserDto {
    adminId: number;
    email: string;
    fullName: string;
    role: string;
    institutionId: number | null;
    googleId: string | null;
}
export declare class AuthTokensDto {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    user: AuthUserDto;
}
