"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WorkoutType, WorkoutTypeLabels } from "@/types/workout";
import { Footprints, Dumbbell, Bike, Heart, Music, BedDouble, MoreHorizontal, Weight } from "lucide-react";

interface WorkoutInputProps {
  selectedWorkouts: Record<WorkoutType, boolean>;
  descriptions: Record<WorkoutType, string>;
  onWorkoutToggle: (workoutType: WorkoutType) => void;
  onDescriptionChange: (workoutType: WorkoutType, description: string) => void;
}

const workoutIcons: Record<WorkoutType, React.ComponentType<{ className?: string }>> = {
  [WorkoutType.WALKING]: Footprints,
  [WorkoutType.YOGA]: Heart,
  [WorkoutType.CYCLING]: Bike,
  [WorkoutType.GYM]: Dumbbell,
  [WorkoutType.WEIGHT_LIFTING_HOME]: Weight,
  [WorkoutType.DANCE_ZUMBA]: Music,
  [WorkoutType.NO_WORKOUT]: BedDouble,
  [WorkoutType.OTHER]: MoreHorizontal,
};

export function WorkoutInput({
  selectedWorkouts,
  descriptions,
  onWorkoutToggle,
  onDescriptionChange,
}: WorkoutInputProps) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      {/* Animated gradient border on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 animate-border-spin bg-gradient-to-r from-blue-700 via-purple-800 to-pink-900 dark:from-blue-300 dark:via-purple-400 dark:to-pink-500 blur-sm" />
        <div className="absolute inset-[1px] bg-background rounded-lg" />
      </div>
      
      <div className="relative z-10">
        <CardHeader>
          <CardTitle className="text-lg">Workouts (Select all that apply)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Workout Type Selection */}
          <div className="space-y-3 hover-cancel">
            <Label>Workout Types</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(WorkoutType).map((workoutValue) => {
                const Icon = workoutIcons[workoutValue];
                const isSelected = selectedWorkouts[workoutValue];
                return (
                  <label
                    key={workoutValue}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover-cancel ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-accent"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name={`workout-${workoutValue}`}
                      checked={isSelected}
                      onChange={() => onWorkoutToggle(workoutValue)}
                      className="h-4 w-4 text-primary rounded"
                    />
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium text-sm">{WorkoutTypeLabels[workoutValue]}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Description for OTHER workout type */}
          {selectedWorkouts[WorkoutType.OTHER] && (
            <div className="space-y-2">
              <Label htmlFor="workout-description-other">
                Other Workout Description *
              </Label>
              <Textarea
                id="workout-description-other"
                placeholder="Describe your workout..."
                value={descriptions[WorkoutType.OTHER] || ""}
                onChange={(e) => onDescriptionChange(WorkoutType.OTHER, e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          )}
          
          {/* Optional notes for selected workout types (excluding NO_WORKOUT and OTHER) */}
          {Object.values(WorkoutType)
            .filter(
              (type) =>
                selectedWorkouts[type] &&
                type !== WorkoutType.NO_WORKOUT &&
                type !== WorkoutType.OTHER
            )
            .map((workoutValue) => (
              <div key={`notes-${workoutValue}`} className="space-y-2">
                <Label htmlFor={`workout-notes-${workoutValue}`}>
                  {WorkoutTypeLabels[workoutValue]} - Notes (Optional)
                </Label>
                <Textarea
                  id={`workout-notes-${workoutValue}`}
                  placeholder="Add any additional details..."
                  value={descriptions[workoutValue] || ""}
                  onChange={(e) => onDescriptionChange(workoutValue, e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
            ))}
        </CardContent>
      </div>
    </Card>
  );
}
