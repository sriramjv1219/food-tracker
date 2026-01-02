"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
        <div>
          <h2 className="text-3xl font-bold">Food Tracker</h2>
          <p className="mt-2 text-gray-400">Sign in to track your meals</p>
        </div>
        <Button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full"
          size="lg"
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
