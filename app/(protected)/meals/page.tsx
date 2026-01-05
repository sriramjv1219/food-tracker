"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MealInput } from "@/components/meal-input";
import { WorkoutInput } from "@/components/workout-input";
import { MealType, Source } from "@/types/meal";
import { WorkoutType } from "@/types/workout";
import { saveMealsAction, fetchMealsAction } from "@/app/actions/meals";
import { saveWorkoutsAction, fetchWorkoutsAction } from "@/app/actions/workouts";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Calendar } from "lucide-react";

type MealData = {
  source: Source | "";
  foodDescription: string;
};

type MealsState = Record<MealType, MealData>;

export default function MealsPage() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [meals, setMeals] = useState<MealsState>({
    [MealType.BREAKFAST]: { source: "", foodDescription: "" },
    [MealType.LUNCH]: { source: "", foodDescription: "" },
    [MealType.EVENING_SNACKS]: { source: "", foodDescription: "" },
    [MealType.DINNER]: { source: "", foodDescription: "" },
  });
  const [selectedWorkouts, setSelectedWorkouts] = useState<Record<WorkoutType, boolean>>({
    [WorkoutType.WALKING]: false,
    [WorkoutType.YOGA]: false,
    [WorkoutType.CYCLING]: false,
    [WorkoutType.GYM]: false,
    [WorkoutType.WEIGHT_LIFTING_HOME]: false,
    [WorkoutType.DANCE_ZUMBA]: false,
    [WorkoutType.NO_WORKOUT]: false,
    [WorkoutType.OTHER]: false,
  });
  const [workoutDescriptions, setWorkoutDescriptions] = useState<Record<WorkoutType, string>>({
    [WorkoutType.WALKING]: "",
    [WorkoutType.YOGA]: "",
    [WorkoutType.CYCLING]: "",
    [WorkoutType.GYM]: "",
    [WorkoutType.WEIGHT_LIFTING_HOME]: "",
    [WorkoutType.DANCE_ZUMBA]: "",
    [WorkoutType.NO_WORKOUT]: "",
    [WorkoutType.OTHER]: "",
  });

  // Format date for display
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Fetch meals and workout for the selected date
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Convert Date to YYYY-MM-DD string to avoid timezone issues
        const dateString = date.toISOString().split('T')[0];
        
        // Fetch meals and workouts in parallel
        const [mealsResult, workoutsResult] = await Promise.all([
          fetchMealsAction({ date: dateString }),
          fetchWorkoutsAction({ date: dateString }),
        ]);

        if (mealsResult.success) {
          const newMeals: MealsState = {
            [MealType.BREAKFAST]: { source: "", foodDescription: "" },
            [MealType.LUNCH]: { source: "", foodDescription: "" },
            [MealType.EVENING_SNACKS]: { source: "", foodDescription: "" },
            [MealType.DINNER]: { source: "", foodDescription: "" },
          };

          // Populate with fetched data
          Object.entries(mealsResult.data.meals).forEach(([mealType, mealData]) => {
            if (mealData) {
              newMeals[mealType as MealType] = {
                source: mealData.source as Source,
                foodDescription: mealData.foodDescription || "",
              };
            }
          });

          setMeals(newMeals);
        }
        
        if (workoutsResult.success && workoutsResult.data.workouts.length > 0) {
          // Reset workout selections
          const newSelectedWorkouts: Record<WorkoutType, boolean> = {
            [WorkoutType.WALKING]: false,
            [WorkoutType.YOGA]: false,
            [WorkoutType.CYCLING]: false,
            [WorkoutType.GYM]: false,
            [WorkoutType.WEIGHT_LIFTING_HOME]: false,
            [WorkoutType.DANCE_ZUMBA]: false,
            [WorkoutType.NO_WORKOUT]: false,
            [WorkoutType.OTHER]: false,
          };
          const newWorkoutDescriptions: Record<WorkoutType, string> = {
            [WorkoutType.WALKING]: "",
            [WorkoutType.YOGA]: "",
            [WorkoutType.CYCLING]: "",
            [WorkoutType.GYM]: "",
            [WorkoutType.WEIGHT_LIFTING_HOME]: "",
            [WorkoutType.DANCE_ZUMBA]: "",
            [WorkoutType.NO_WORKOUT]: "",
            [WorkoutType.OTHER]: "",
          };
          
          // Populate with fetched workout data
          workoutsResult.data.workouts.forEach((workout) => {
            newSelectedWorkouts[workout.workoutType] = true;
            newWorkoutDescriptions[workout.workoutType] = workout.description || "";
          });
          
          setSelectedWorkouts(newSelectedWorkouts);
          setWorkoutDescriptions(newWorkoutDescriptions);
        } else {
          // Reset workouts if no data for this date
          setSelectedWorkouts({
            [WorkoutType.WALKING]: false,
            [WorkoutType.YOGA]: false,
            [WorkoutType.CYCLING]: false,
            [WorkoutType.GYM]: false,
            [WorkoutType.WEIGHT_LIFTING_HOME]: false,
            [WorkoutType.DANCE_ZUMBA]: false,
            [WorkoutType.NO_WORKOUT]: false,
            [WorkoutType.OTHER]: false,
          });
          setWorkoutDescriptions({
            [WorkoutType.WALKING]: "",
            [WorkoutType.YOGA]: "",
            [WorkoutType.CYCLING]: "",
            [WorkoutType.GYM]: "",
            [WorkoutType.WEIGHT_LIFTING_HOME]: "",
            [WorkoutType.DANCE_ZUMBA]: "",
            [WorkoutType.NO_WORKOUT]: "",
            [WorkoutType.OTHER]: "",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [date]);

  const handleSourceChange = (mealType: MealType, source: Source) => {
    setMeals((prev) => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        source,
        // Clear description if fasting
        foodDescription:
          source === Source.FASTING ? "" : prev[mealType].foodDescription,
      },
    }));
  };

  const handleDescriptionChange = (mealType: MealType, description: string) => {
    setMeals((prev) => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        foodDescription: description,
      },
    }));
  };

  const handleWorkoutToggle = (workoutType: WorkoutType) => {
    const isCurrentlySelected = selectedWorkouts[workoutType];
    const willBeSelected = !isCurrentlySelected;
    
    // If selecting "Could not workout today", deselect all other workouts
    if (workoutType === WorkoutType.NO_WORKOUT && willBeSelected) {
      setSelectedWorkouts({
        [WorkoutType.WALKING]: false,
        [WorkoutType.YOGA]: false,
        [WorkoutType.CYCLING]: false,
        [WorkoutType.GYM]: false,
        [WorkoutType.WEIGHT_LIFTING_HOME]: false,
        [WorkoutType.DANCE_ZUMBA]: false,
        [WorkoutType.NO_WORKOUT]: true,
        [WorkoutType.OTHER]: false,
      });
      
      // Clear all descriptions except NO_WORKOUT
      setWorkoutDescriptions({
        [WorkoutType.WALKING]: "",
        [WorkoutType.YOGA]: "",
        [WorkoutType.CYCLING]: "",
        [WorkoutType.GYM]: "",
        [WorkoutType.WEIGHT_LIFTING_HOME]: "",
        [WorkoutType.DANCE_ZUMBA]: "",
        [WorkoutType.NO_WORKOUT]: "",
        [WorkoutType.OTHER]: "",
      });
      return;
    }
    
    // If selecting any other workout, deselect "Could not workout today"
    if (workoutType !== WorkoutType.NO_WORKOUT && willBeSelected) {
      setSelectedWorkouts((prev) => ({
        ...prev,
        [workoutType]: true,
        [WorkoutType.NO_WORKOUT]: false,
      }));
      
      // Clear NO_WORKOUT description
      setWorkoutDescriptions((prev) => ({
        ...prev,
        [WorkoutType.NO_WORKOUT]: "",
      }));
      return;
    }
    
    // Normal toggle behavior (deselecting)
    setSelectedWorkouts((prev) => ({
      ...prev,
      [workoutType]: !prev[workoutType],
    }));
    
    // Clear description when unchecking
    if (isCurrentlySelected) {
      setWorkoutDescriptions((prev) => ({
        ...prev,
        [workoutType]: "",
      }));
    }
  };

  const handleWorkoutDescriptionChange = (workoutType: WorkoutType, description: string) => {
    setWorkoutDescriptions((prev) => ({
      ...prev,
      [workoutType]: description,
    }));
  };

  const handleSubmit = async () => {
    // Filter out meals without a source selected
    const mealsToSave = Object.entries(meals)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, meal]) => meal.source !== "")
      .map(([mealType, meal]) => ({
        mealType: mealType as MealType,
        source: meal.source as Source,
        foodDescription: meal.foodDescription,
      }));

    // Prepare workouts to save
    const workoutsToSave = Object.entries(selectedWorkouts)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, isSelected]) => isSelected)
      .map(([workoutType]) => ({
        workoutType: workoutType as WorkoutType,
        description: workoutDescriptions[workoutType as WorkoutType] || "",
      }));

    // Check if there's data to save
    const hasWorkouts = workoutsToSave.length > 0;
    const hasMeals = mealsToSave.length > 0;

    if (!hasWorkouts && !hasMeals) {
      toast({
        title: "No data to save",
        description: "Please select at least one meal or workout.",
        variant: "destructive",
      });
      return;
    }

    // Validate OTHER workout type has description
    if (selectedWorkouts[WorkoutType.OTHER] && !workoutDescriptions[WorkoutType.OTHER].trim()) {
      toast({
        title: "Missing description",
        description: "Please provide a description for 'Other' workout type.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Convert Date to YYYY-MM-DD string to avoid timezone issues
      const dateString = date.toISOString().split('T')[0];
      
      // Save meals and workouts in parallel
      const promises = [];
      
      if (hasMeals) {
        promises.push(
          saveMealsAction({
            date: dateString,
            meals: mealsToSave,
          })
        );
      }
      
      if (hasWorkouts) {
        promises.push(
          saveWorkoutsAction({
            date: dateString,
            workouts: workoutsToSave,
          })
        );
      }
      
      const results = await Promise.all(promises);
      
      // Check if all operations succeeded
      const allSuccess = results.every((result) => result.success);
      
      if (allSuccess) {
        toast({
          title: "Success!",
          description: hasWorkouts && hasMeals 
            ? "Meals and workouts saved successfully"
            : hasWorkouts 
            ? "Workouts saved successfully"
            : "Meals saved successfully",
        });
      } else {
        const failedResult = results.find((result) => !result.success);
        toast({
          title: "Error",
          description: failedResult?.success === false ? failedResult.error : "Failed to save data",
          variant: "destructive",
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const goToPreviousDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    setDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    setDate(newDate);
  };

  const goToToday = () => {
    setDate(new Date());
  };

  const minDate = new Date("2026-01-01");
  minDate.setHours(0, 0, 0, 0);
  
  const currentDate = new Date(date);
  currentDate.setHours(0, 0, 0, 0);
  
  const isAtMinDate = currentDate.getTime() <= minDate.getTime();
  const isToday =
    date.toDateString() === new Date().toDateString();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Daily Tracker</h1>
        <p className="text-muted-foreground">
          Track your meals and workouts for better health insights
        </p>
      </div>

      {/* Date Navigation */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-2 flex-1">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousDay}
            disabled={isAtMinDate}
          >
            ← Previous
          </Button>
          {!isToday && (
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextDay}
            disabled={isToday}
          >
            Next →
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Workout Input */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Workouts</h2>
            <WorkoutInput
              selectedWorkouts={selectedWorkouts}
              descriptions={workoutDescriptions}
              onWorkoutToggle={handleWorkoutToggle}
              onDescriptionChange={handleWorkoutDescriptionChange}
            />
          </div>

          {/* Meal Inputs */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Meals</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.values(MealType).map((mealType) => (
                <MealInput
                  key={mealType}
                  mealType={mealType}
                  source={meals[mealType].source}
                  foodDescription={meals[mealType].foodDescription}
                  onSourceChange={(source) => handleSourceChange(mealType, source)}
                  onDescriptionChange={(desc) =>
                    handleDescriptionChange(mealType, desc)
                  }
                />
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              size="lg"
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save All Data
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
