export interface IAuthRepository {
    createToken(email: string, token: string, expiresAt: Date): Promise<void>;
    getToken(token: string): Promise<any>;
    markTokenAsUsed(token: string): Promise<void>;
}
