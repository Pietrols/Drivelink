// ─────────────────────────────────────────────────────────────────────────────
// @drivelink/schemas
// Zod validation schemas shared across all apps and services.
//
// The SAME schema is imported by the React form (client-side validation)
// AND the Express endpoint (server-side validation). Change a rule once,
// both sides update automatically.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import { Role } from "@drivelink/types";

// ── Register ──────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Must be a valid email address")
    .toLowerCase()
    .trim(),

  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{7,14}$/,
      "Must be a valid phone number with country code",
    )
    .optional(),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),

  roles: z
    .array(z.nativeEnum(Role))
    .min(1, "Select at least one role")
    .max(2, "Select at most two roles")
    .refine(
      (roles) => !roles.includes(Role.ADMIN),
      "Admin role cannot be self-assigned",
    ),
});

// ── Verify Email ──────────────────────────────────────────────────────────────

export const VerifyEmailSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must be numeric"),
});

// ── Phone OTP ─────────────────────────────────────────────────────────────────

export const SendPhoneOtpSchema = z.object({
  phone: z
    .string({ required_error: "Phone number is required" })
    .regex(
      /^\+?[1-9]\d{7,14}$/,
      "Must be a valid phone number with country code",
    ),
});

export const VerifyPhoneSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, "Must be a valid phone number"),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must be numeric"),
});

// ── Login ─────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Must be a valid email address")
    .toLowerCase()
    .trim(),
  password: z.string({ required_error: "Password is required" }).min(1),
});

// ── Refresh Token ─────────────────────────────────────────────────────────────

export const RefreshTokenSchema = z.object({
  refreshToken: z
    .string({ required_error: "Refresh token is required" })
    .min(1),
});

// ── Inferred Types ────────────────────────────────────────────────────────────
// These give you the TypeScript type that matches the schema exactly.
// Use these instead of manually writing interfaces that could go out of sync.

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;
export type VerifyPhoneInput = z.infer<typeof VerifyPhoneSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
