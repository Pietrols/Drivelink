// ── Enums ─────────────────────────────────────────────────────────────────────

export enum Role {
  GUEST = "GUEST",
  HOST = "HOST",
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

export enum Pillar {
  RENTAL = "RENTAL",
  SERVICE = "SERVICE",
}

export enum ListingStatus {
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  EN_ROUTE = "EN_ROUTE",
  HANDED_OVER = "HANDED_OVER",
  ACTIVE = "ACTIVE",
  RETURN_PENDING = "RETURN_PENDING",
  RETURNED = "RETURNED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  DISPUTED = "DISPUTED",
}

export enum HandoverType {
  PICKUP = "PICKUP",
  RETURN = "RETURN",
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
  createdAt: Date;
  updatedAt: Date;
}

// ── Listing ───────────────────────────────────────────────────────────────────

export interface Listing {
  id: string;
  hostId: string;
  pillar: Pillar;
  category: string;
  subcategory: string | null;
  title: string;
  description: string | null;
  pricePerDay: number;
  location: string;
  status: ListingStatus;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ── Booking ───────────────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  guestId: string;
  hostId: string;
  listingId: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  pricePerDay: number;
  totalAmount: number;
  status: BookingStatus;
  pickupLocation: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  changedById: string;
  reason: string | null;
  createdAt: Date;
}

export interface Handover {
  id: string;
  bookingId: string;
  type: HandoverType;
  guestConfirmed: boolean;
  hostConfirmed: boolean;
  guestConfirmedAt: Date | null;
  hostConfirmedAt: Date | null;
  createdAt: Date;
}

// ── Auth Payloads ─────────────────────────────────────────────────────────────

export interface RegisterPayload {
  email: string;
  password: string;
  phone?: string;
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

// ── Auth Responses ────────────────────────────────────────────────────────────

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

export interface ApiError {
  message: string;
  code: string;
  errors?: Record<string, string[]>;
}
