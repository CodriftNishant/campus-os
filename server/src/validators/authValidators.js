import { z } from "zod";

const password = z.string().min(8);
const email = z.string().email().toLowerCase();

export const studentSignupSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email,
    password,
    rollNumber: z.string().min(4),
    department: z.string().min(2),
    year: z.coerce.number().min(1).max(6),
    phoneNumber: z.string().min(8),
    interests: z.array(z.string().min(2)).default([])
  })
});

export const clubSignupSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email,
    password,
    clubName: z.string().min(2),
    category: z.string().min(2),
    description: z.string().default(""),
    contactEmail: email
  })
});

export const loginSchema = z.object({
  body: z.object({ email, password: z.string().min(1), role: z.enum(["student", "club_admin", "super_admin"]).optional() })
});
