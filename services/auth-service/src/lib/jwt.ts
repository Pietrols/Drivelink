import jwt, { SignOptions } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config";
import { Role } from "@lenda/types";

export interface AccessTokenPayload {
  sub: string;
  roles: Role[];
  jti: string;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: "refresh";
}

export function signAccessToken(userId: string, roles: Role[]): string {
  const payload: Omit<AccessTokenPayload, "iat" | "exp"> = {
    sub: userId,
    roles,
    jti: uuidv4(),
    type: "access",
  };
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions);
}

export function signRefreshToken(userId: string): {
  token: string;
  jti: string;
} {
  const jti = uuidv4();
  const payload: Omit<RefreshTokenPayload, "iat" | "exp"> = {
    sub: userId,
    jti,
    type: "refresh",
  };
  const token = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
  return { token, jti };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

export function durationToSeconds(duration: string): number {
  const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid duration: ${duration}`);
  return parseInt(match[1]) * units[match[2]];
}
