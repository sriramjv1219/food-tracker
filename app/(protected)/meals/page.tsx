"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MealInput } from "@/components/meal-input";
import { MealType, Source } from "@/types/meal";
import { saveMealsAction, fetchMealsAction } from "@/app/actions/meals";
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

  // Format date for display
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Fetch meals for the selected date
  useEffect(() => {
    async function fetchMeals() {
      setIsLoading(true);
      try {
        const result = await fetchMealsAction({ date });

        if (result.success) {
          const newMeals: MealsState = {
            [MealType.BREAKFAST]: { source: "", foodDescription: "" },
            [MealType.LUNCH]: { source: "", foodDescription: "" },
            [MealType.EVENING_SNACKS]: { source: "", foodDescription: "" },
            [MealType.DINNER]: { source: "", foodDescription: "" },
          };

          // Populate with fetched data
          Object.entries(result.data.meals).forEach(([mealType, mealData]) => {
            if (mealData) {
              newMeals[mealType as MealType] = {
                source: mealData.source as Source,
                foodDescription: mealData.foodDescription || "",
              };
            }
          });

          setMeals(newMeals);
        }
      } catch (error) {
        console.error("Error fetching meals:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMeals();
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

    if (mealsToSave.length === 0) {
      toast({
        title: "No meals to save",
        description: "Please select at least one meal source.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveMealsAction({
        date,
        meals: mealsToSave,
      });

      if (result.success) {
        toast({
          title: "Success!",
          description: result.data.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save meals. Please try again.",
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
        <h1 className="text-3xl font-bold">Daily Meal Tracker</h1>
        <p className="text-muted-foreground">
          Track your meals for better health insights
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
          {/* Meal Inputs */}
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
                  Save All Meals
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
