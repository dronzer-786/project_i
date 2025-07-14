import crypto from 'crypto';

interface TokenData {
    userIdentifier: string;
    createdAt: number;
    expiresAt: number;
    used: boolean;
    ipAddress: string | null;
    userAgent: string | null;
}

interface TokenValidationResult {
    valid: boolean;
    reason: 'SUCCESS' | 'TOKEN_NOT_FOUND' | 'TOKEN_EXPIRED' | 'TOKEN_ALREADY_USED' | 'INVALID_CLIENT';
}

class TokenManager {
    private activeTokens: Map<string, TokenData>;

    constructor() {
        this.activeTokens = new Map<string, TokenData>();
    }

    generateSecureToken(userIdentifier: string = 'anonymous'): string {
        const token = crypto.randomBytes(32).toString('hex');
        const timestamp = Date.now();
        const expiresAt = timestamp + 5 * 60 * 1000; // 5 minutes

        const tokenData: TokenData = {
            userIdentifier,
            createdAt: timestamp,
            expiresAt,
            used: false,
            ipAddress: null,
            userAgent: null
        };

        this.activeTokens.set(token, tokenData);

        // Cleanup this token after expiration time
        setTimeout(() => {
            this.activeTokens.delete(token);
        }, 5 * 60 * 1000);

        return token;
    }

    validateAndUseToken(token: string, ipAddress: string, userAgent: string): TokenValidationResult {
        const tokenData = this.activeTokens.get(token);

        if (!tokenData) {
            return { valid: false, reason: 'TOKEN_NOT_FOUND' };
        }

        if (Date.now() > tokenData.expiresAt) {
            this.activeTokens.delete(token);
            return { valid: false, reason: 'TOKEN_EXPIRED' };
        }

        if (tokenData.used) {
            this.activeTokens.delete(token);
            return { valid: false, reason: 'TOKEN_ALREADY_USED' };
        }

        if (!tokenData.ipAddress) {
            tokenData.ipAddress = ipAddress;
            tokenData.userAgent = userAgent;
        } else if (
            tokenData.ipAddress !== ipAddress ||
            tokenData.userAgent !== userAgent
        ) {
            this.activeTokens.delete(token);
            return { valid: false, reason: 'INVALID_CLIENT' };
        }

        tokenData.used = true;
        this.activeTokens.delete(token);
        return { valid: true, reason: 'SUCCESS' };
    }

    cleanup(): void {
        const now = Date.now();
        for (const [token, data] of this.activeTokens.entries()) {
            if (now > data.expiresAt) {
                this.activeTokens.delete(token);
            }
        }
    }
}

export const tokenManager = new TokenManager();

// Global periodic cleanup every 60 seconds
setInterval(() => {
    tokenManager.cleanup();
}, 60 * 1000);
