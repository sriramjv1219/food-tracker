"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Utensils, UserCheck } from "lucide-react";
import { UserRole } from "@/lib/constants";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    {
      href: "/meals",
      label: "Daily Tracker",
      icon: Utensils,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    ...(session?.user?.role === UserRole.SUPER_ADMIN
      ? [
          {
            href: "/approval",
            label: "Approval",
            icon: UserCheck,
          },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo/Brand */}
        <div className="flex items-center gap-6">
          <Link href="/meals" className="flex items-center gap-2">
            <Utensils className="h-6 w-6" />
            <span className="font-bold text-lg hidden sm:inline">
              Food Tracker
            </span>
          </Link>

          {/* Navigation */}
          {session && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {session && (
            <>
              {/* User Info */}
              <div className="hidden sm:flex items-center gap-2 px-3">
                <span className="text-sm text-muted-foreground">
                  {session.user?.name || session.user?.email}
                </span>
              </div>

              {/* Sign Out Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {session && (
        <div className="md:hidden border-t">
          <nav className="container flex items-center gap-1 px-4 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
