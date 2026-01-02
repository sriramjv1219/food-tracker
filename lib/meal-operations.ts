import mongoose from "mongoose";
import MealEntry, { IMealEntry, MealType, Source } from "@/models/MealEntry";
import connectDB from "./mongoose";

export interface MealEntryInput {
  mealType: MealType;
  source: Source;
  foodDescription?: string;
}

export interface BulkUpsertMealsParams {
  userId: string | mongoose.Types.ObjectId;
  date: Date;
  meals: MealEntryInput[];
}

/**
 * Performs a bulk upsert operation for meal entries.
 * Updates existing meals or inserts new ones based on the compound key (userId, date, mealType).
 *
 * @param params - Object containing userId, date, and array of meals
 * @returns BulkWrite operation result
 *
 * @example
 * ```typescript
 * const result = await bulkUpsertMeals({
 *   userId: user._id,
 *   date: new Date('2026-01-03'),
 *   meals: [
 *     { mealType: MealType.BREAKFAST, source: Source.HOME, foodDescription: 'Oatmeal' },
 *     { mealType: MealType.LUNCH, source: Source.OUTSIDE, foodDescription: 'Burger' }
 *   ]
 * });
 * ```
 */
export async function bulkUpsertMeals({
  userId,
  date,
  meals,
}: BulkUpsertMealsParams) {
  await connectDB();
  
  if (!meals || meals.length === 0) {
    return { modifiedCount: 0, upsertedCount: 0 };
  }

  // Convert userId to ObjectId if it's a string
  const userObjectId =
    typeof userId === "string" 
      ? mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : (() => { throw new Error(`Invalid userId format: ${userId}`); })()
      : userId;

  // Normalize date to start of day (remove time component)
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  // Build bulkWrite operations
  const operations = meals.map((meal) => ({
    updateOne: {
      filter: {
        userId: userObjectId,
        date: normalizedDate,
        mealType: meal.mealType,
      },
      update: {
        $set: {
          source: meal.source,
          foodDescription: meal.foodDescription || "",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          userId: userObjectId,
          date: normalizedDate,
          mealType: meal.mealType,
          createdAt: new Date(),
        },
      },
      upsert: true,
    },
  }));

  // Execute bulkWrite operation
  const result = await MealEntry.bulkWrite(operations);

  return result;
}

/**
 * Deletes all meal entries for a specific user and date.
 * Useful when you want to replace all meals for a day.
 *
 * @param userId - User's ObjectId or string
 * @param date - Date for which to delete meals
 * @returns Delete operation result
 */
export async function deleteMealsForDate(
  userId: string | mongoose.Types.ObjectId,
  date: Date
) {
  await connectDB();
  
  const userObjectId =
    typeof userId === "string" 
      ? mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : (() => { throw new Error(`Invalid userId format: ${userId}`); })()
      : userId;

  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  return await MealEntry.deleteMany({
    userId: userObjectId,
    date: normalizedDate,
  });
}

/**
 * Gets all meals for a specific user and date.
 *
 * @param userId - User's ObjectId or string
 * @param date - Date for which to fetch meals
 * @returns Array of meal entries
 */
export async function getMealsForDate(
  userId: string | mongoose.Types.ObjectId,
  date: Date
): Promise<IMealEntry[]> {
  await connectDB();
  
  const userObjectId =
    typeof userId === "string" 
      ? mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : (() => { throw new Error(`Invalid userId format: ${userId}`); })()
      : userId;

  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  const endOfDay = new Date(normalizedDate);
  endOfDay.setHours(23, 59, 59, 999);

  return await MealEntry.find({
    userId: userObjectId,
    date: {
      $gte: normalizedDate,
      $lte: endOfDay,
    },
  }).sort({ createdAt: 1 });
}
