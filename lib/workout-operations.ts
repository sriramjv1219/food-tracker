import mongoose from "mongoose";
import WorkoutEntry, { IWorkoutEntry, WorkoutType } from "@/models/WorkoutEntry";
import connectDB from "./mongoose";

export interface WorkoutEntryInput {
  workoutType: WorkoutType;
  description?: string;
}

export interface BulkUpsertWorkoutsParams {
  userId: string | mongoose.Types.ObjectId;
  date: Date;
  workouts: WorkoutEntryInput[];
}

/**
 * Performs a bulk upsert operation for workout entries.
 * Updates existing workouts or inserts new ones based on (userId, date, workoutType).
 *
 * @param params - Object containing userId, date, and array of workouts
 * @returns BulkWrite operation result
 *
 * @example
 * ```typescript
 * // Date should be pre-normalized to UTC midnight by caller
 * const result = await bulkUpsertWorkouts({
 *   userId: user._id,
 *   date: new Date(Date.UTC(2026, 0, 3, 0, 0, 0, 0)), // Jan 3, 2026 UTC
 *   workouts: [
 *     { workoutType: WorkoutType.GYM, description: 'Chest and triceps' },
 *     { workoutType: WorkoutType.WALKING }
 *   ]
 * });
 * ```
 */
export async function bulkUpsertWorkouts({
  userId,
  date,
  workouts,
}: BulkUpsertWorkoutsParams) {
  await connectDB();

  if (!workouts || workouts.length === 0) {
    return { modifiedCount: 0, upsertedCount: 0 };
  }

  // Convert userId to ObjectId if it's a string
  const userObjectId =
    typeof userId === "string"
      ? mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : (() => {
            throw new Error(`Invalid userId format: ${userId}`);
          })()
      : userId;

  // Use the date as-is (should already be normalized to UTC midnight by caller)
  const normalizedDate = date;

  // Build bulkWrite operations
  const operations = workouts.map((workout) => ({
    updateOne: {
      filter: {
        userId: userObjectId,
        date: normalizedDate,
        workoutType: workout.workoutType,
      },
      update: {
        $set: {
          description: workout.description || "",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          userId: userObjectId,
          date: normalizedDate,
          workoutType: workout.workoutType,
          createdAt: new Date(),
        },
      },
      upsert: true,
    },
  }));

  // Execute bulkWrite operation
  const result = await WorkoutEntry.bulkWrite(operations);

  return result;
}

/**
 * Deletes all workout entries for a specific user and date.
 * Useful when you want to replace all workouts for a day.
 *
 * @param userId - User's ObjectId or string
 * @param date - Date for which to delete workouts
 * @returns Delete operation result
 */
export async function deleteWorkoutsForDate(
  userId: string | mongoose.Types.ObjectId,
  date: Date
) {
  await connectDB();

  const userObjectId =
    typeof userId === "string"
      ? mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : (() => {
            throw new Error(`Invalid userId format: ${userId}`);
          })()
      : userId;

  // Use the date as-is (should already be normalized to UTC midnight by caller)
  const normalizedDate = date;

  return await WorkoutEntry.deleteMany({
    userId: userObjectId,
    date: normalizedDate,
  });
}

/**
 * Gets all workout entries for a specific user and date.
 *
 * @param userId - User's ObjectId or string
 * @param date - Date for which to fetch workouts
 * @returns Array of workout entries
 */
export async function getWorkoutsForDate(
  userId: string | mongoose.Types.ObjectId,
  date: Date
): Promise<IWorkoutEntry[]> {
  await connectDB();

  const userObjectId =
    typeof userId === "string"
      ? mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : (() => {
            throw new Error(`Invalid userId format: ${userId}`);
          })()
      : userId;

  // Use the date as-is (should already be normalized to UTC midnight by caller)
  const normalizedDate = date;

  // Create end of day in UTC (23:59:59.999)
  const endOfDay = new Date(normalizedDate.getTime() + 86399999); // Add 23:59:59.999 in milliseconds

  return await WorkoutEntry.find({
    userId: userObjectId,
    date: {
      $gte: normalizedDate,
      $lte: endOfDay,
    },
  }).sort({ createdAt: 1 });
}
