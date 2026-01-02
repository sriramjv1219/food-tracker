"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Source Selection */}
        <div className="space-y-2">
          <Label htmlFor={`${mealType}-source`}>Source *</Label>
          <Select value={source} onValueChange={onSourceChange}>
            <SelectTrigger id={`${mealType}-source`}>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Source).map((sourceValue) => {
                const Icon = sourceIcons[sourceValue];
                return (
                  <SelectItem key={sourceValue} value={sourceValue}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {sourceLabels[sourceValue]}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
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
    </Card>
  );
}
