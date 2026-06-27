import { z } from "zod";

export const updateStudentProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    department: z.string().min(2).optional(),
    year: z.coerce.number().min(1).max(6).optional(),
    phoneNumber: z.string().min(8).optional(),
    interests: z.array(z.string().min(2)).optional(),
    bio: z.string().max(500).optional(),
    avatarUrl: z.string().url().optional().or(z.literal(""))
  })
});

export const updateClubProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    clubName: z.string().min(2).optional(),
    category: z.string().min(2).optional(),
    description: z.string().max(1000).optional(),
    logoUrl: z.string().url().optional().or(z.literal("")),
    contactEmail: z.string().email().optional()
  })
});
