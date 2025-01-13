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

// TypeScript type derived from the schema
export type LocationRequest = z.infer<typeof locationRequestSchema>;

// TypeScript interface for the weather response
export interface WeatherResponse {
  location: {
    city: string;
    country: string;
  };
  forecast: {
    sportsCastAnnouncement: string;
    dailyForecast: Array<{
      date: string;
      temperature: {
        max: number;
        min: number;
        unit: 'C';
      };
      conditions: string;
      precipitationChance: number;
    }>;
  };
  explanation: string;
}