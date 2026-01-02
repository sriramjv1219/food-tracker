import mongoose, { Schema, Model, Document } from "mongoose";
import { UserRole } from "@/lib/constants";

export { UserRole };

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email: string;
  image?: string;
  provider?: string;
  role: UserRole;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
      trim: true,
    },
    provider: {
      type: String,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.MEMBER,
    },
    approved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
