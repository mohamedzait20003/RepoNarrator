import { Link, useRouterState } from "@tanstack/react-router";
import { Settings, FileText, CreditCard, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils/utils";
import { useAccountName } from "@/lib/auth/account";

const PROFILE_NAV = [
  { label: "Settings", to: "/customer/$name/profile/settings", icon: Settings },
  { label: "Resume", to: "/customer/$name/profile/resume", icon: FileText },
  { label: "Billing", to: "/customer/$name/profile/billing", icon: CreditCard },
  {
    label: "Security",
    to: "/customer/$name/profile/security",
    icon: ShieldCheck,
  },
] as const;

export function ProfileSidebar() {
  const name = useAccountName();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="md:w-56 md:shrink-0">
      <nav className="flex gap-1 overflow-x-auto md:flex-col">
        {PROFILE_NAV.map(({ label, to, icon: Icon }) => {
          const active = pathname.startsWith(to.replace("$name", name));
          return (
            <Link
              key={to}
              to={to}
              params={{ name }}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
