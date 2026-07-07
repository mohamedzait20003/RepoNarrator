import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";

export function DangerZone() {
  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Danger zone</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data. This cannot be
          undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          Delete account
        </Button>
      </CardContent>
    </Card>
  );
}
