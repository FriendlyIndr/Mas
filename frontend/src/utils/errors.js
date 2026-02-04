export class AccessTokenExpiredError extends Error {
    constructor() {
        super('Access token expired');
        this.name = 'AccessTokenExpiredError';
    }
}

export class RefreshTokenExpiredError extends Error {
    constructor() {
        super('Refresh token expired');
        this.name = 'RefreshTokenExpiredError';
    }
}