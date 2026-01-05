import { z } from "zod";
import { WorkoutType } from "@/models/WorkoutEntry";

// Single workout entry validation schema
export const workoutEntrySchema = z.object({
  workoutType: z.nativeEnum(WorkoutType, {
    message: "Invalid workout type",
  }),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

// Save workouts validation schema (supports multiple workouts)
export const saveWorkoutsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid date format. Expected YYYY-MM-DD",
  }),
  workouts: z
    .array(workoutEntrySchema)
    .min(1, "At least one workout is required")
    .max(10, "Cannot save more than 10 workouts at once")
    .refine(
      (workouts) => {
        const workoutTypes = workouts.map((w) => w.workoutType);
        return workoutTypes.length === new Set(workoutTypes).size;
      },
      {
        message: "Duplicate workout types are not allowed",
      }
    ),
});

// Fetch workouts validation schema
export const fetchWorkoutsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid date format. Expected YYYY-MM-DD",
  }),
});

// Export types inferred from schemas
export type WorkoutEntryInput = z.infer<typeof workoutEntrySchema>;
export type SaveWorkoutsInput = z.infer<typeof saveWorkoutsSchema>;
export type FetchWorkoutsInput = z.infer<typeof fetchWorkoutsSchema>;
