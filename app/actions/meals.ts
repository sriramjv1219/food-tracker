"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { bulkUpsertMeals, getMealsForDate } from "@/lib/meal-operations";
import { MealType } from "@/models/MealEntry";
import {
  saveMealsSchema,
  fetchMealsSchema,
  type SaveMealsInput,
  type FetchMealsInput,
} from "@/lib/validations/meal";
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
 * Server action to save or update multiple meal entries for a given date.
 * Uses bulkWrite with upsert to avoid duplicates based on (userId, date, mealType).
 *
 * @param input - Object containing date and array of meals
 * @returns Success response with operation stats or error response
 */
export async function saveMealsAction(
  input: SaveMealsInput
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
    const validatedInput = saveMealsSchema.parse(input);

    // 3. Normalize date to calendar day (remove time component)
    const normalizedDate = new Date(validatedInput.date);
    normalizedDate.setHours(0, 0, 0, 0);

    // 4. Perform bulk upsert
    const result = await bulkUpsertMeals({
      userId: session.user.id,
      date: normalizedDate,
      meals: validatedInput.meals,
    });

    return {
      success: true,
      data: {
        modifiedCount: result.modifiedCount || 0,
        upsertedCount: result.upsertedCount || 0,
        message: "Meals saved successfully",
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

    // Handle duplicate key errors
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return {
        success: false,
        error: "Duplicate meal entry detected",
      };
    }

    // Handle database errors
    console.error("Error saving meals:", error);
    return {
      success: false,
      error: "Failed to save meals. Please try again.",
    };
  }
}

/**
 * Server action to fetch all meal entries for the logged-in user for a given date.
 * Returns data grouped by mealType for easy UI consumption.
 *
 * @param input - Object containing the date to fetch meals for
 * @returns Success response with grouped meals or error response
 */
export async function fetchMealsAction(
  input: FetchMealsInput
): Promise<
  ActionResponse<{
    date: string;
    meals: Record<
      MealType,
      {
        mealType: MealType;
        source: string;
        foodDescription?: string;
        createdAt: string;
        updatedAt: string;
      } | null
    >;
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
    const validatedInput = fetchMealsSchema.parse(input);

    // 3. Normalize date to calendar day
    const normalizedDate = new Date(validatedInput.date);
    normalizedDate.setHours(0, 0, 0, 0);

    // 4. Fetch meals from database
    const mealEntries = await getMealsForDate(session.user.id, normalizedDate);

    // 5. Group meals by mealType for easy UI consumption
    const groupedMeals: Record<MealType, any> = {
      [MealType.BREAKFAST]: null,
      [MealType.LUNCH]: null,
      [MealType.EVENING_SNACKS]: null,
      [MealType.DINNER]: null,
    };

    mealEntries.forEach((meal) => {
      groupedMeals[meal.mealType] = {
        mealType: meal.mealType,
        source: meal.source,
        foodDescription: meal.foodDescription || undefined,
        createdAt: meal.createdAt.toISOString(),
        updatedAt: meal.updatedAt.toISOString(),
      };
    });

    return {
      success: true,
      data: {
        date: normalizedDate.toISOString(),
        meals: groupedMeals,
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
    console.error("Error fetching meals:", error);
    return {
      success: false,
      error: "Failed to fetch meals. Please try again.",
    };
  }
}

/**
 * Server action to fetch meal entries for a date range.
 * Useful for weekly or monthly views.
 *
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Success response with meals array or error response
 */
export async function fetchMealsRangeAction(
  startDate: Date,
  endDate: Date
): Promise<
  ActionResponse<
    Array<{
      date: string;
      mealType: MealType;
      source: string;
      foodDescription?: string;
    }>
  >
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

    // 2. Validate date range
    if (startDate > endDate) {
      return {
        success: false,
        error: "Start date must be before end date",
      };
    }

    // 3. Fetch meals for each date in the range
    const dateArray: Date[] = [];
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fetch meals for all dates
    const allMeals = await Promise.all(
      dateArray.map((date) => getMealsForDate(session.user.id, date))
    );

    // Flatten and format results
    const formattedMeals = allMeals.flat().map((meal) => ({
      date: meal.date.toISOString(),
      mealType: meal.mealType,
      source: meal.source,
      foodDescription: meal.foodDescription || undefined,
    }));

    return {
      success: true,
      data: formattedMeals,
    };
  } catch (error) {
    console.error("Error fetching meals range:", error);
    return {
      success: false,
      error: "Failed to fetch meals. Please try again.",
    };
  }
}
