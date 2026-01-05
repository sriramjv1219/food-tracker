"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { bulkUpsertWorkouts, getWorkoutsForDate } from "@/lib/workout-operations";
import { WorkoutType } from "@/models/WorkoutEntry";
import {
  saveWorkoutsSchema,
  fetchWorkoutsSchema,
  type SaveWorkoutsInput,
  type FetchWorkoutsInput,
} from "@/lib/validations/workout";
import { ZodError } from "zod";

// Standard response types
type SuccessResponse<T> = {
  success: true;
  data: T;
};

type ErrorResponse = {
  success: false;
  error: string;
  details?: unknown;
};

type ActionResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Server action to save or update multiple workout entries for a given date.
 * Uses bulkWrite with upsert to avoid duplicates based on (userId, date, workoutType).
 *
 * @param input - Object containing date and array of workouts
 * @returns Success response with operation stats or error response
 */
export async function saveWorkoutsAction(
  input: SaveWorkoutsInput
): Promise<
  ActionResponse<{
    modifiedCount: number;
    upsertedCount: number;
    message: string;
  }>
> {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized. Please sign in to continue.",
      };
    }

    // 2. Input validation
    const validatedInput = saveWorkoutsSchema.parse(input);

    // 3. Parse date string as UTC to avoid timezone shifts
    // Input format: "YYYY-MM-DD"
    const [year, month, day] = validatedInput.date.split("-").map(Number);
    const normalizedDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    // 4. Perform bulk upsert
    const result = await bulkUpsertWorkouts({
      userId: session.user.id,
      date: normalizedDate,
      workouts: validatedInput.workouts,
    });

    return {
      success: true,
      data: {
        modifiedCount: result.modifiedCount || 0,
        upsertedCount: result.upsertedCount || 0,
        message: "Workouts saved successfully",
      },
    };
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Invalid input data",
        details: error.issues,
      };
    }

    // Handle duplicate key errors
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return {
        success: false,
        error: "Duplicate workout entry detected",
      };
    }

    // Handle database errors
    console.error("Error saving workouts:", error);
    return {
      success: false,
      error: "Failed to save workouts. Please try again.",
    };
  }
}

/**
 * Server action to fetch workout entries for the logged-in user for a given date.
 *
 * @param input - Object containing the date to fetch workouts for
 * @returns Success response with array of workouts or error response
 */
export async function fetchWorkoutsAction(
  input: FetchWorkoutsInput
): Promise<
  ActionResponse<{
    date: string;
    workouts: Array<{
      workoutType: WorkoutType;
      description?: string;
      createdAt: string;
      updatedAt: string;
    }>;
  }>
> {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized. Please sign in to continue.",
      };
    }

    // 2. Input validation
    const validatedInput = fetchWorkoutsSchema.parse(input);

    // 3. Parse date string as UTC to avoid timezone shifts
    // Input format: "YYYY-MM-DD"
    const [year, month, day] = validatedInput.date.split("-").map(Number);
    const normalizedDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    // 4. Fetch workouts from database
    const workoutEntries = await getWorkoutsForDate(session.user.id, normalizedDate);

    return {
      success: true,
      data: {
        date: normalizedDate.toISOString(),
        workouts: workoutEntries.map((workout) => ({
          workoutType: workout.workoutType,
          description: workout.description || undefined,
          createdAt: workout.createdAt.toISOString(),
          updatedAt: workout.updatedAt.toISOString(),
        })),
      },
    };
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return {
        success: false,
        error: "Invalid input data",
        details: error.issues,
      };
    }

    // Handle database errors
    console.error("Error fetching workouts:", error);
    return {
      success: false,
      error: "Failed to fetch workouts. Please try again.",
    };
  }
}
