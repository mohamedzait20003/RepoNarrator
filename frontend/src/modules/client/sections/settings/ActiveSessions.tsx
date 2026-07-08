import { Monitor, Smartphone, Tablet, MapPin, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { useStore } from "@/store";
import { EmptyState } from "../../components/EmptyState";

function deviceIcon(deviceType: string | null): LucideIcon {
  if (deviceType && /mobile/i.test(deviceType)) return Smartphone;
  if (deviceType && /tablet/i.test(deviceType)) return Tablet;
  return Monitor;
}

export function ActiveSessions() {
  const sessions = useStore((s) => s.userData?.sessions ?? []);

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>
          Devices currently signed in to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {sessions.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No active sessions"
            description="Sessions appear here after you sign in."
          />
        ) : (
          <ul className="divide-y divide-border">
            {sessions.map((session, i) => {
              const Icon = deviceIcon(session.deviceType);
              return (
                <li
                  key={`${session.deviceType ?? "device"}-${i}`}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {session.deviceType ?? "Unknown device"}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {session.location ?? "Unknown location"}
                    </p>
                  </div>
                  {i === 0 && <Badge variant="emerald">This device</Badge>}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
