"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, LogOut } from "lucide-react";

export default function AccessPendingPage() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Access Pending</CardTitle>
          <CardDescription>
            Your account is awaiting approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              Hello <span className="font-medium text-foreground">{session?.user?.name || session?.user?.email}</span>,
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account has been created successfully. However, you need approval from an administrator to access the application.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please contact the administrator or wait for approval. You will be notified once your access is granted.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
