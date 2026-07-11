import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .regex(/^\d+$/, "Username must be a phone number (digits only)"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
