"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getUnapprovedUsersAction, approveUserAction } from "@/app/actions/users";
import { UserRole } from "@/lib/constants";
import { Check, Loader2, UserCheck, Users } from "lucide-react";

type UnapprovedUser = {
  id: string;
  name?: string;
  email: string;
  image?: string;
  createdAt: string;
};

export default function ApprovalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<UnapprovedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());

  // Redirect if not SUPER_ADMIN
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || session.user.role !== UserRole.SUPER_ADMIN) {
      router.push("/meals");
    }
  }, [session, status, router]);

  // Fetch unapproved users
  useEffect(() => {
    async function fetchUsers() {
      if (status === "loading" || !session) return;
      
      setIsLoading(true);
      try {
        const result = await getUnapprovedUsersAction();
        if (result.success) {
          setUsers(result.data);
        } else {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch unapproved users." + (error instanceof Error ? ` ${error.message}` : ""),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [session, status, toast]);

  const handleApprove = async (userId: string) => {
    setApprovingIds((prev) => new Set(prev).add(userId));

    try {
      const result = await approveUserAction(userId);

      if (result.success) {
        toast({
          title: "Success",
          description: result.data.message,
        });

        // Remove approved user from list
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve user."+ (error instanceof Error ? ` ${error.message}` : ""),
        variant: "destructive",
      });
    } finally {
      setApprovingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <UserCheck className="h-8 w-8" />
          <h1 className="text-3xl font-bold">User Approval</h1>
        </div>
        <p className="text-muted-foreground">
          Review and approve pending user access requests
        </p>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No pending approvals</p>
            <p className="text-sm text-muted-foreground mt-1">
              All users have been approved
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {users.length} user{users.length !== 1 ? "s" : ""} pending approval
            </p>
          </div>

          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || user.email}
                          className="h-12 w-12 rounded-full"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary">
                            {(user.name || user.email)[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">
                          {user.name || "Unknown User"}
                        </CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(user.id)}
                      disabled={approvingIds.has(user.id)}
                    >
                      {approvingIds.has(user.id) ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Requested access on{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
