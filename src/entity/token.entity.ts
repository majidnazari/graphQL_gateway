export class Token {
    token: string;
    expiresAt: Date;

    isExpired() {
        return this.expiresAt < new Date();
    }
}