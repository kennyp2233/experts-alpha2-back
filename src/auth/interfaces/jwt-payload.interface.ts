// src/auth/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
    sub: string;
    email: string;
    username: string;
    iat?: number;
    exp?: number;
  }