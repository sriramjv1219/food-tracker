import mongoose from "mongoose";
import User, { IUser } from "@/models/User";
import connectDB from "./mongoose";

export interface CreateOrUpdateUserParams {
  email: string;
  name?: string;
  image?: string;
  provider?: string;
}

/**
 * Creates or updates a User document based on email (unique key).
 * Used during NextAuth login to ensure user exists in the database.
 *
 * @param params - Object containing email (required), name, image, and provider
 * @returns The created or updated User document
 *
 * @example
 * ```typescript
 * const user = await createOrUpdateUser({
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   image: 'https://example.com/avatar.jpg',
 *   provider: 'google'
 * });
 * ```
 */
export async function createOrUpdateUser({
  email,
  name,
  image,
  provider,
}: CreateOrUpdateUserParams): Promise<IUser> {
  await connectDB();

  // Perform upsert: update if exists, create if not
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    {
      $set: {
        ...(name && { name }),
        ...(image && { image }),
        ...(provider && { provider: provider.toLowerCase() }),
      },
      $setOnInsert: {
        email: email.toLowerCase().trim(),
      },
    },
    {
      upsert: true, // Create if doesn't exist
      new: true, // Return the updated document
      runValidators: true, // Run schema validators
    }
  );

  return user;
}

/**
 * Finds a user by email.
 *
 * @param email - User's email address
 * @returns User document or null if not found
 */
export async function findUserByEmail(
  email: string
): Promise<IUser | null> {
  await connectDB();

  return await User.findOne({ email: email.toLowerCase().trim() });
}

/**
 * Finds a user by their MongoDB ObjectId.
 *
 * @param userId - User's ObjectId or string
 * @returns User document or null if not found
 */
export async function findUserById(
  userId: string | mongoose.Types.ObjectId
): Promise<IUser | null> {
  await connectDB();

  const userObjectId =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  return await User.findById(userObjectId);
}
