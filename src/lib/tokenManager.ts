import crypto from "crypto";
import jwt from "jsonwebtoken";

type BaseTokenPayload = {
  nonce: string;
  fingerprint: string;
  createdAt: number;
  expiresAt: number;
  entropy: string;
};

type SecureTokenPayload = BaseTokenPayload & {
  used: boolean;
};

type OneTimeTokenPayload = BaseTokenPayload & {
  usageNonce: string;
  microTimestamp: string;
  type: "one-time";
};

type TokenValidationResult<T extends object = Record<string, unknown>> =
  | { valid: true; reason: "SUCCESS"; payload: T }
  | { valid: false; reason: TokenInvalidReason };

type TokenInvalidReason =
  | "INVALID_TOKEN_FORMAT"
  | "INVALID_TOKEN_ENCODING"
  | "INVALID_TOKEN_SIGNATURE"
  | "TOKEN_EXPIRED"
  | "INVALID_CLIENT_FINGERPRINT"
  | "TOKEN_TOO_FRESH"
  | "TOKEN_TOO_OLD"
  | "VALIDATION_ERROR"
  | "INVALID_TOKEN_TYPE"
  | "ONE_TIME_VALIDATION_ERROR";

class StatelessTokenManager {
  private JWT_SECRET: string;
  private ENCRYPTION_KEY: string;
  private isProduction: boolean;

  constructor() {
    this.JWT_SECRET = process.env.HASHED_PASSWORD_CODE as string;
    this.ENCRYPTION_KEY = crypto.randomBytes(32).toString("hex");
    this.isProduction = process.env.NODE_ENV === "production";
  }

  generateNonce(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  createFingerprint(ipAddress: string, userAgent: string): string {
    const data = `${ipAddress}:${userAgent}`;
    return crypto
      .createHash("sha256")
      .update(data)
      .digest("hex")
      .substring(0, 16);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher("aes-256-cbc", this.ENCRYPTION_KEY);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  }

  decrypt(encryptedData: string): string | null {
    try {
      const [, encrypted] = encryptedData.split(":");
      const decipher = crypto.createDecipher(
        "aes-256-cbc",
        this.ENCRYPTION_KEY
      );
      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch {
      return null;
    }
  }

  generateSecureToken(ipAddress: string, userAgent: string): string {
    const timestamp = Date.now();
    const payload: SecureTokenPayload = {
      nonce: this.generateNonce(),
      fingerprint: this.createFingerprint(ipAddress, userAgent),
      createdAt: timestamp,
      expiresAt: timestamp + 10 * 60 * 1000,
      used: false,
      entropy: crypto.randomBytes(8).toString("hex"),
    };

    const token = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: "10m",
      algorithm: "HS256",
    });

    return Buffer.from(token).toString("base64url");
  }

  validateAndUseToken(
    token: string,
    ipAddress: string,
    userAgent: string
  ): TokenValidationResult<SecureTokenPayload> {
    try {
      if (!token || typeof token !== "string") {
        return { valid: false, reason: "INVALID_TOKEN_FORMAT" };
      }

      let jwtToken: string;
      try {
        jwtToken = Buffer.from(token, "base64url").toString();
      } catch {
        return { valid: false, reason: "INVALID_TOKEN_ENCODING" };
      }

      let payload: SecureTokenPayload;
      try {
        payload = jwt.verify(jwtToken, this.JWT_SECRET) as SecureTokenPayload;
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          typeof (error as { name: unknown }).name === "string"
        ) {
          const errorName = (error as { name: string }).name;
          return {
            valid: false,
            reason:
              errorName === "TokenExpiredError"
                ? "TOKEN_EXPIRED"
                : "INVALID_TOKEN_SIGNATURE",
          };
        }

        return { valid: false, reason: "VALIDATION_ERROR" };
      }

      if (Date.now() > payload.expiresAt) {
        return { valid: false, reason: "TOKEN_EXPIRED" };
      }

      const expectedFingerprint = this.createFingerprint(ipAddress, userAgent);
      if (payload.fingerprint !== expectedFingerprint) {
        return { valid: false, reason: "INVALID_CLIENT_FINGERPRINT" };
      }

      const age = Date.now() - payload.createdAt;
      if (age < 1000) {
        return { valid: false, reason: "TOKEN_TOO_FRESH" };
      }

      return { valid: true, reason: "SUCCESS", payload };
    } catch (error) {
      console.error("Token validation error:", error);
      return { valid: false, reason: "VALIDATION_ERROR" };
    }
  }

  generateOneTimeToken(ipAddress: string, userAgent: string): string {
    const timestamp = Date.now();
    const payload: OneTimeTokenPayload = {
      nonce: this.generateNonce(),
      fingerprint: this.createFingerprint(ipAddress, userAgent),
      createdAt: timestamp,
      expiresAt: timestamp + 2 * 60 * 1000,
      usageNonce: crypto.randomBytes(16).toString("hex"),
      microTimestamp: process.hrtime.bigint().toString(),
      type: "one-time",
      entropy: crypto.randomBytes(16).toString("hex"),
    };

    const token = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: "2m",
      algorithm: "HS256",
    });

    return Buffer.from(token).toString("base64url");
  }

  validateOneTimeToken(
    token: string,
    ipAddress: string,
    userAgent: string
  ): TokenValidationResult<OneTimeTokenPayload & { requestSignature: string }> {
    try {
      if (!token || typeof token !== "string") {
        return { valid: false, reason: "INVALID_TOKEN_FORMAT" };
      }

      let jwtToken: string;
      try {
        jwtToken = Buffer.from(token, "base64url").toString();
      } catch {
        return { valid: false, reason: "INVALID_TOKEN_ENCODING" };
      }

      let payload: OneTimeTokenPayload;
      try {
        payload = jwt.verify(jwtToken, this.JWT_SECRET) as OneTimeTokenPayload;
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          typeof (error as { name: unknown }).name === "string"
        ) {
          const errorName = (error as { name: string }).name;
          return {
            valid: false,
            reason:
              errorName === "TokenExpiredError"
                ? "TOKEN_EXPIRED"
                : "INVALID_TOKEN_SIGNATURE",
          };
        }

        return { valid: false, reason: "VALIDATION_ERROR" };
      }

      if (payload.type !== "one-time") {
        return { valid: false, reason: "INVALID_TOKEN_TYPE" };
      }

      if (Date.now() > payload.expiresAt) {
        return { valid: false, reason: "TOKEN_EXPIRED" };
      }

      const expectedFingerprint = this.createFingerprint(ipAddress, userAgent);
      if (payload.fingerprint !== expectedFingerprint) {
        return { valid: false, reason: "INVALID_CLIENT_FINGERPRINT" };
      }

      const age = Date.now() - payload.createdAt;
      if (age > 30 * 1000) {
        return { valid: false, reason: "TOKEN_TOO_OLD" };
      }

      const requestSignature = crypto
        .createHash("sha256")
        .update(token + ipAddress + userAgent + Date.now())
        .digest("hex");

      return {
        valid: true,
        reason: "SUCCESS",
        payload: { ...payload, requestSignature },
      };
    } catch (error) {
      console.error("One-time token validation error:", error);
      return { valid: false, reason: "ONE_TIME_VALIDATION_ERROR" };
    }
  }
}

export const statelessTokenManager = new StatelessTokenManager();
