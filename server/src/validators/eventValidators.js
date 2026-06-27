import { z } from "zod";

export const eventSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    posterUrl: z.string().url().optional().or(z.literal("")),
    deadline: z.coerce.date(),
    eventDate: z.coerce.date(),
    venue: z.string().min(2),
    eligibility: z.string().default("Open to all students"),
    tags: z.array(z.string().min(2)).default([]),
    category: z.string().min(2),
    clubName: z.string().min(2),
    capacity: z.coerce.number().min(0).default(0)
  })
});
