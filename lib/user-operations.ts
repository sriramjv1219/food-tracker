import mongoose from "mongoose";
import User, { IUser, UserRole } from "@/models/User";
import connectDB from "./mongoose";
import { SUPER_ADMIN_EMAIL } from "@/lib/constants";

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

  const normalizedEmail = email.toLowerCase().trim();
  const isSuperAdmin = normalizedEmail === SUPER_ADMIN_EMAIL;

  // Check if user exists
  let user = await User.findOne({ email: normalizedEmail });

  if (user) {
    // Update existing user
    user.name = name || user.name;
    user.image = image || user.image;
    user.provider = provider ? provider.toLowerCase() : user.provider;
    user.role = isSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.MEMBER;
    if (isSuperAdmin) {
      user.approved = true;
    }
    await user.save();
  } else {
    // Create new user
    user = await User.create({
      email: normalizedEmail,
      name,
      image,
      provider: provider?.toLowerCase(),
      role: isSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.MEMBER,
      approved: isSuperAdmin,
    });
  }

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

/**
 * Gets all unapproved users.
 *
 * @returns Array of unapproved user documents
 */
export async function getUnapprovedUsers(): Promise<IUser[]> {
  await connectDB();

  return await User.find({ approved: false }).sort({ createdAt: -1 });
}

/**
 * Approves a user by their ID.
 *
 * @param userId - User's ObjectId or string
 * @returns Updated user document or null if not found
 */
export async function approveUser(
  userId: string | mongoose.Types.ObjectId
): Promise<IUser | null> {
  await connectDB();

  const userObjectId =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  return await User.findByIdAndUpdate(
    userObjectId,
    { $set: { approved: true } },
    { new: true, runValidators: true }
  );
}
