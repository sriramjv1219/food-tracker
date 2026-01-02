import mongoose, { Schema, Model, Document } from "mongoose";

export enum MealType {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  EVENING_SNACKS = "EVENING_SNACKS",
  DINNER = "DINNER",
}

export enum Source {
  HOME = "HOME",
  OUTSIDE = "OUTSIDE",
  FASTING = "FASTING",
}

export interface IMealEntry extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  mealType: MealType;
  source: Source;
  foodDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MealEntrySchema = new Schema<IMealEntry>(
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
    mealType: {
      type: String,
      enum: {
        values: Object.values(MealType),
        message: "{VALUE} is not a valid meal type",
      },
      required: [true, "Meal type is required"],
    },
    source: {
      type: String,
      enum: {
        values: Object.values(Source),
        message: "{VALUE} is not a valid source",
      },
      required: [true, "Source is required"],
    },
    foodDescription: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to enforce ONE meal entry per user per day per meal type
MealEntrySchema.index({ userId: 1, date: 1, mealType: 1 }, { unique: true });

// Additional index for efficient querying by user and date range
MealEntrySchema.index({ userId: 1, date: -1 });

const MealEntry: Model<IMealEntry> =
  mongoose.models.MealEntry ||
  mongoose.model<IMealEntry>("MealEntry", MealEntrySchema);

export default MealEntry;
