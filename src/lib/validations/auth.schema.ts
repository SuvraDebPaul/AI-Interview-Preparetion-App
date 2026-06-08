import { z } from "zod";

// ── Shared field schemas ───────────────────────────────────────
// Single source of truth — reused in register + reset password
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password too long")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number");

// ── Schemas ───────────────────────────────────────────────────
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be under 50 characters")
      // Allow letters (any script), spaces, hyphens, apostrophes — supports international names
      .regex(/^[\p{L}\s'\-]+$/u, "Name can only contain letters, spaces, hyphens, and apostrophes"),
    email: z.email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required").max(100, "Password too long"),
});

export const forgetPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

//Types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgetPassword = z.infer<typeof forgetPasswordSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
