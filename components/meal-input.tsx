"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MealType, Source } from "@/types/meal";
import { Home, Store, Ban } from "lucide-react";

interface MealInputProps {
  mealType: MealType;
  source: Source | "";
  foodDescription: string;
  onSourceChange: (value: Source) => void;
  onDescriptionChange: (value: string) => void;
}

const mealTypeLabels: Record<MealType, string> = {
  [MealType.BREAKFAST]: "Breakfast",
  [MealType.LUNCH]: "Lunch",
  [MealType.EVENING_SNACKS]: "Evening Snacks",
  [MealType.DINNER]: "Dinner",
};

const sourceIcons = {
  [Source.HOME]: Home,
  [Source.OUTSIDE]: Store,
  [Source.FASTING]: Ban,
};

const sourceLabels = {
  [Source.HOME]: "Home",
  [Source.OUTSIDE]: "Outside",
  [Source.FASTING]: "Fasting",
};

export function MealInput({
  mealType,
  source,
  foodDescription,
  onSourceChange,
  onDescriptionChange,
}: MealInputProps) {
  const label = mealTypeLabels[mealType];

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      {/* Animated gradient border on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 animate-border-spin bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 dark:from-gray-300 dark:via-gray-400 dark:to-gray-500 blur-sm" />
        <div className="absolute inset-[1px] bg-background rounded-lg" />
      </div>
      
      <div className="relative z-10">
        <CardHeader>
          <CardTitle className="text-lg">{label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        {/* Source Selection */}
        <div className="space-y-3 hover-cancel">
          <Label>Source *</Label>
          <div className="flex flex-col gap-3">
            {Object.values(Source).map((sourceValue) => {
              const Icon = sourceIcons[sourceValue];
              return (
                <label
                  key={sourceValue}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover-cancel ${
                    source === sourceValue
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-accent"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${mealType}-source`}
                    value={sourceValue}
                    checked={source === sourceValue}
                    onChange={(e) => onSourceChange(e.target.value as Source)}
                    className="h-4 w-4 text-primary"
                  />
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{sourceLabels[sourceValue]}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Food Description */}
        {source && source !== Source.FASTING && (
          <div className="space-y-2">
            <Label htmlFor={`${mealType}-description`}>
              Food Description (Optional)
            </Label>
            <Textarea
              id={`${mealType}-description`}
              placeholder="What did you eat?"
              value={foodDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {foodDescription.length}/500 characters
            </p>
          </div>
        )}
      </CardContent>
      </div>
    </Card>
  );
}
