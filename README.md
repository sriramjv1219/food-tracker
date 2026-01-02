# Food Tracker

A full-stack meal tracking application built with Next.js 15, MongoDB, and NextAuth. Track your daily meals, monitor eating patterns, and manage user access with role-based authorization.

## Features

### 🍽️ Meal Tracking
- Track meals for Breakfast, Lunch, Evening Snacks, and Dinner
- Mark meal sources: Home, Outside, or Fasting
- Add optional food descriptions (up to 500 characters)
- Date navigation with minimum date restriction (Jan 1, 2026)
- Animated card hover effects

### 🔐 Authentication & Authorization
- Google OAuth integration via NextAuth
- Role-based access control (SUPER_ADMIN, MEMBER)
- User approval workflow
- Protected routes with middleware
- Session management with JWT

### 👥 User Management
- Super Admin dashboard for user approvals
- Unapproved users see access pending page
- Automatic super admin assignment for configured email
- Real-time approval status updates

### 🎨 UI/UX
- Dark/Light theme toggle with system preference detection
- Responsive design for mobile and desktop
- Animated gradient borders on card hover
- Custom radio button styling for meal sources
- Toast notifications for user feedback

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** NextAuth.js with Google Provider
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Type Safety:** TypeScript
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js v20.19.6
- MongoDB Atlas account
- Google OAuth credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sriramjv1219/food-tracker.git
cd food-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-random-secret>
NEXTAUTH_URL_INTERNAL=http://localhost:3000

# Google OAuth Credentials
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── (protected)/          # Protected routes
│   │   ├── approval/         # User approval page (SUPER_ADMIN only)
│   │   ├── dashboard/        # Dashboard page
│   │   └── meals/            # Meal tracking page
│   ├── access-pending/       # Unapproved user page
│   ├── actions/              # Server actions
│   │   ├── meals.ts          # Meal CRUD operations
│   │   └── users.ts          # User management actions
│   ├── auth/                 # Authentication pages
│   └── api/auth/             # NextAuth API routes
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── header.tsx            # Navigation header
│   ├── meal-input.tsx        # Meal input card
│   └── theme-provider.tsx    # Theme context provider
├── lib/                      # Utility functions
│   ├── auth.ts               # NextAuth configuration
│   ├── constants.ts          # App constants
│   ├── meal-operations.ts    # Meal database operations
│   └── user-operations.ts    # User database operations
├── models/                   # Mongoose schemas
│   ├── MealEntry.ts          # Meal entry schema
│   └── User.ts               # User schema
└── types/                    # TypeScript types
    ├── meal.ts               # Meal types
    └── next-auth.d.ts        # NextAuth type extensions
```

## Configuration

### Super Admin Email

Update the super admin email in `lib/constants.ts`:

```typescript
export const SUPER_ADMIN_EMAIL = "your-email@example.com";
```

### Minimum Date Restriction

The application restricts date navigation to January 1, 2026 and later. Update in `app/(protected)/meals/page.tsx` if needed.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- `MONGODB_URI`
- `NEXTAUTH_URL` (your production URL)
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## API Routes

### Server Actions

- `saveMealsAction` - Save multiple meals for a date
- `fetchMealsAction` - Fetch meals for a specific date
- `getUnapprovedUsersAction` - Get list of unapproved users (SUPER_ADMIN)
- `approveUserAction` - Approve a user (SUPER_ADMIN)

## Security

- Server-side authorization checks
- Protected API routes
- Secure session management
- Environment variables for sensitive data
- Edge runtime compatible middleware
- Input validation with Zod

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Author

Sriram JV - [GitHub](https://github.com/sriramjv1219)
