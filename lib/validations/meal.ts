import { z } from "zod";
import { MealType, Source } from "@/models/MealEntry";

// Single meal entry validation schema
export const mealEntrySchema = z.object({
  mealType: z.nativeEnum(MealType, {
    message: "Invalid meal type",
  }),
  source: z.nativeEnum(Source, {
    message: "Invalid source",
  }),
  foodDescription: z
    .string()
    .max(500, "Food description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

// Bulk save meals validation schema
export const saveMealsSchema = z.object({
  date: z.coerce.date({
    message: "Invalid date format",
  }),
  meals: z
    .array(mealEntrySchema)
    .min(1, "At least one meal is required")
    .max(10, "Cannot save more than 10 meals at once"),
});

// Fetch meals validation schema
export const fetchMealsSchema = z.object({
  date: z.coerce.date({
    message: "Invalid date format",
  }),
});

// Export types inferred from schemas
export type MealEntryInput = z.infer<typeof mealEntrySchema>;
export type SaveMealsInput = z.infer<typeof saveMealsSchema>;
export type FetchMealsInput = z.infer<typeof fetchMealsSchema>;