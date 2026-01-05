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

export const WorkoutTypeLabels: Record<WorkoutType, string> = {
  [WorkoutType.WALKING]: "Walking (>6000 steps)",
  [WorkoutType.YOGA]: "Yoga",
  [WorkoutType.CYCLING]: "Cycling",
  [WorkoutType.GYM]: "Gym",
  [WorkoutType.WEIGHT_LIFTING_HOME]: "Weight Lifting At Home",
  [WorkoutType.DANCE_ZUMBA]: "Dance / Zumba",
  [WorkoutType.NO_WORKOUT]: "Could not workout today",
  [WorkoutType.OTHER]: "Other",
};
