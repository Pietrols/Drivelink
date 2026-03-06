// ─────────────────────────────────────────────────────────────────────────────
// @drivelink/types
// Single source of truth for all TypeScript interfaces and enums.
// Rule: if a data shape is used in more than one place, it lives here.
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums ─────────────────────────────────────────────────────────────────────

export enum Role {
  CLIENT = "CLIENT",
  DRIVER = "DRIVER",
  ADMIN = "ADMIN",
}

export enum KycStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum OtpType {
  EMAIL = "EMAIL",
  PHONE = "PHONE",
}

// ── User ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  phone: string | null;
  roles: Role[];
  emailVerified: boolean;
  phoneVerified: boolean;
  kycStatus: KycStatus;
  isActive: boolean;
  canDeliver: boolean;
  deliveryRadiusKm: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Auth Request Payloads ─────────────────────────────────────────────────────

export interface RegisterPayload {
  email: string;
  phone?: string;
  password: string;
  roles: Role[];
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface VerifyPhonePayload {
  phone: string;
  otp: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

// ── Auth Response Payloads ────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface MessageResponse {
  message: string;
}

// ── API Error ─────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}
