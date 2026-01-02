# Backend API Documentation

## Server Actions for Meal Tracking

### 1. Save Meals (`saveMealsAction`)

**Purpose:** Create or update meal entries for a specific date using bulk upsert.

**Usage:**
```typescript
import { saveMealsAction } from "@/app/actions/meals";
import { MealType, Source } from "@/models/MealEntry";

const result = await saveMealsAction({
  date: new Date("2026-01-03"),
  meals: [
    {
      mealType: MealType.BREAKFAST,
      source: Source.HOME,
      foodDescription: "Oatmeal with fruits"
    },
    {
      mealType: MealType.LUNCH,
      source: Source.OUTSIDE,
      foodDescription: "Pizza"
    }
  ]
});

if (result.success) {
  console.log(`Modified: ${result.data.modifiedCount}, Added: ${result.data.upsertedCount}`);
} else {
  console.error(result.error);
}
```

**Input Schema:**
- `date`: Date object or string (required)
- `meals`: Array of meal objects (1-10 items)
  - `mealType`: "BREAKFAST" | "LUNCH" | "EVENING_SNACKS" | "DINNER"
  - `source`: "HOME" | "OUTSIDE" | "FASTING"
  - `foodDescription`: string (optional, max 500 chars)

**Response:**
```typescript
// Success
{
  success: true,
  data: {
    modifiedCount: number,
    upsertedCount: number,
    message: string
  }
}

// Error
{
  success: false,
  error: string,
  details?: unknown
}
```

---

### 2. Fetch Meals (`fetchMealsAction`)

**Purpose:** Get all meal entries for the logged-in user for a specific date, grouped by meal type.

**Usage:**
```typescript
import { fetchMealsAction } from "@/app/actions/meals";

const result = await fetchMealsAction({
  date: new Date("2026-01-03")
});

if (result.success) {
  const { meals } = result.data;
  // meals.BREAKFAST, meals.LUNCH, meals.EVENING_SNACKS, meals.DINNER
}
```

**Input Schema:**
- `date`: Date object or string (required)

**Response:**
```typescript
// Success
{
  success: true,
  data: {
    date: string, // ISO date string
    meals: {
      BREAKFAST: MealData | null,
      LUNCH: MealData | null,
      EVENING_SNACKS: MealData | null,
      DINNER: MealData | null
    }
  }
}

type MealData = {
  mealType: MealType,
  source: string,
  foodDescription?: string,
  createdAt: string,
  updatedAt: string
}
```

---

### 3. Fetch Meals Range (`fetchMealsRangeAction`)

**Purpose:** Get meal entries for a date range (useful for weekly/monthly views).

**Usage:**
```typescript
import { fetchMealsRangeAction } from "@/app/actions/meals";

const result = await fetchMealsRangeAction(
  new Date("2026-01-01"),
  new Date("2026-01-07")
);

if (result.success) {
  result.data.forEach(meal => {
    console.log(`${meal.date} - ${meal.mealType}: ${meal.source}`);
  });
}
```

**Response:**
```typescript
// Success
{
  success: true,
  data: Array<{
    date: string,
    mealType: MealType,
    source: string,
    foodDescription?: string
  }>
}
```

---

## Security Features

✅ **Authentication Required:** All actions check for valid NextAuth session
✅ **User Isolation:** Users can only access their own meal data
✅ **Input Validation:** Zod schemas validate all inputs
✅ **SQL Injection Safe:** Mongoose ODM protects against injection attacks
✅ **No Client-Side userId:** User ID is always extracted from server session

## Error Handling

All actions return standardized responses:
- `success: true` with `data` for successful operations
- `success: false` with `error` message for failures
- Optional `details` field for validation errors

Common error messages:
- "Unauthorized. Please sign in to continue."
- "Invalid input data" (with validation details)
- "Duplicate meal entry detected"
- "Failed to save/fetch meals. Please try again."
