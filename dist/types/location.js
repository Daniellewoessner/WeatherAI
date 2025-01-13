import { z } from "zod";
// Zod schema for location validation
export const locationRequestSchema = z.object({
    location: z.object({
        city: z.string(),
        country: z.string().optional(),
        state: z.string().optional(),
        coordinates: z.object({
            latitude: z.number(),
            longitude: z.number()
        }).optional()
    })
});
