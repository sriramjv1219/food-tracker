import mongoose, { Schema, Model, Document } from "mongoose";

export enum WorkoutType {
  WALKING = "WALKING",
  YOGA = "YOGA",
  CYCLING = "CYCLING",
  GYM = "GYM",
  WEIGHT_LIFTING_HOME = "WEIGHT_LIFTING_HOME",
  DANCE_ZUMBA = "DANCE_ZUMBA",
  NO_WORKOUT = "NO_WORKOUT",
  OTHER = "OTHER",
}

export interface IWorkoutEntry extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  workoutType: WorkoutType;
  description?: string; // For "Other" workout type or additional notes
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutEntrySchema = new Schema<IWorkoutEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
    },
    workoutType: {
      type: String,
      enum: {
        values: Object.values(WorkoutType),
        message: "{VALUE} is not a valid workout type",
      },
      required: [true, "Workout type is required"],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to enforce ONE workout entry per user per day per workout type
WorkoutEntrySchema.index({ userId: 1, date: 1, workoutType: 1 }, { unique: true });

// Additional index for efficient querying by user and date range
WorkoutEntrySchema.index({ userId: 1, date: -1 });

const WorkoutEntry: Model<IWorkoutEntry> =
  mongoose.models.WorkoutEntry ||
  mongoose.model<IWorkoutEntry>("WorkoutEntry", WorkoutEntrySchema);

export default WorkoutEntry;
