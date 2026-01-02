"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUnapprovedUsers, approveUser } from "@/lib/user-operations";
import { UserRole } from "@/lib/constants";

type SuccessResponse<T> = {
  success: true;
  data: T;
};

type ErrorResponse = {
  success: false;
  error: string;
};

type ActionResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Server action to get all unapproved users.
 * Only accessible to SUPER_ADMIN.
 */
export async function getUnapprovedUsersAction(): Promise<
  ActionResponse<
    Array<{
      id: string;
      name?: string;
      email: string;
      image?: string;
      createdAt: string;
    }>
  >
> {
  try {
    // 1. Authentication and authorization check
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized. Please sign in to continue.",
      };
    }

    if (session.user.role !== UserRole.SUPER_ADMIN) {
      return {
        success: false,
        error: "Forbidden. Only administrators can access this resource.",
      };
    }

    // 2. Fetch unapproved users
    const users = await getUnapprovedUsers();

    // 3. Transform and return data
    const userData = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
    }));

    return {
      success: true,
      data: userData,
    };
  } catch (error) {
    console.error("Error fetching unapproved users:", error);
    return {
      success: false,
      error: "Failed to fetch unapproved users. Please try again.",
    };
  }
}

/**
 * Server action to approve a user by ID.
 * Only accessible to SUPER_ADMIN.
 */
export async function approveUserAction(
  userId: string
): Promise<ActionResponse<{ message: string }>> {
  try {
    // 1. Authentication and authorization check
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized. Please sign in to continue.",
      };
    }

    if (session.user.role !== UserRole.SUPER_ADMIN) {
      return {
        success: false,
        error: "Forbidden. Only administrators can approve users.",
      };
    }

    // 2. Validate input
    if (!userId) {
      return {
        success: false,
        error: "User ID is required.",
      };
    }

    // 3. Approve user
    const user = await approveUser(userId);

    if (!user) {
      return {
        success: false,
        error: "User not found.",
      };
    }

    return {
      success: true,
      data: {
        message: `User ${user.email} has been approved successfully.`,
      },
    };
  } catch (error) {
    console.error("Error approving user:", error);
    return {
      success: false,
      error: "Failed to approve user. Please try again.",
    };
  }
}
