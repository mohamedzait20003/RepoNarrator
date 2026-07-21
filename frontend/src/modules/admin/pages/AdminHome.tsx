import { useNavigate } from "@tanstack/react-router";
import { BookOpen, LogOut, ShieldCheck, Users, CreditCard, ScrollText } from "lucide-react";

import { useStore } from "@/store";
import { useLogout } from "@/lib/hooks/useUser";
import { Badge } from "@/common/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/common/components/ui/card";

const PLACEHOLDERS = [
  { icon: Users, title: "Users", desc: "Browse accounts, roles, and activity." },
  { icon: CreditCard, title: "Subscriptions", desc: "Plans, usage, and billing status." },
  { icon: ScrollText, title: "Audit log", desc: "Track admin actions across the platform." },
];

export default function AdminHome() {
  const userData = useStore((s) => s.userData);
  const navigate = useNavigate();
  const logout = useLogout();

  const signOut = () =>
    logout.mutate(undefined, { onSettled: () => void navigate({ to: "/" }) });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
              <BookOpen className="h-4 w-4 text-white" />
            </span>
            <span className="text-base">
              Code<span className="text-violet-600">Atlas</span>
            </span>
            <Badge variant="violet" className="ml-1 gap-1">
              <ShieldCheck className="h-3 w-3" />
              Admin
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block">
              {userData?.name ?? userData?.email ?? "Admin"}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Admin console
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform administration. Full tooling ships in a later release.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PLACEHOLDERS.map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <CardHeader>
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
                  <Icon className="h-5 w-5" />
                </span>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
