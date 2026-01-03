"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-provider";

export default function SignIn() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/meals");
    }
  }, [status, router]);
  
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-20 animate-fade-in">
        <ThemeToggle />
      </div>

      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="apple-blob apple-blob-1"></div>
        <div className="apple-blob apple-blob-2"></div>
        <div className="apple-blob apple-blob-3"></div>
      </div>

      {/* Glassmorphism Container */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {/* Content Container with Animated Border */}
        <div className="relative space-y-8 rounded-2xl border bg-card p-10 text-center shadow-2xl backdrop-blur-xl animate-border-pulse">
          {/* Logo/Title with Staggered Animation */}
          <div className="space-y-3">
            <h2 className="text-5xl font-bold tracking-tight text-foreground animate-fade-in-delay-1">
              Habit Tracker
            </h2>
            <p className="text-lg text-muted-foreground animate-fade-in-delay-2">
              Slow habits. Strong results.
            </p>
            <p className="text-lg text-muted-foreground animate-fade-in-delay-2">
              Track your meals & workouts with elegance
            </p>
          </div>

          {/* Divider */}
          <div className="relative animate-fade-in-delay-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
          </div>

          {/* Sign In Button */}
          <div className="animate-fade-in-delay-4">
            <Button
              onClick={() => signIn("google", { callbackUrl: "/meals" })}
              className="group relative w-full overflow-hidden bg-primary text-primary-foreground px-8 py-6 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              size="lg"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </span>
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            </Button>
          </div>
          {/* Footer Text */}
          <p className="text-sm text-muted-foreground animate-fade-in-delay-5">
            Secure sign-in powered by Google
          </p>
        </div>
      </div>
    </div>
  );
}
