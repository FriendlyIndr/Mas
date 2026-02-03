export class SessionExpireError extends Error {
    constructor() {
        super('Session expired');
        this.name = 'SessionExpiredError';
    }
}