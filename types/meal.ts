// Client-safe type definitions
// These can be imported in both server and client components

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

export type { MealEntryInput } from "@/lib/validations/meal";
