import { Link } from "@tanstack/react-router";
import { Telescope } from "lucide-react";
import { Card, CardContent } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";

export function PositionsSection() {
  return (
    <section className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-xl font-bold text-foreground">Open positions</h2>
          <Badge variant="outline">0 open roles</Badge>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Telescope className="mb-4 h-10 w-10 text-muted-foreground/40" />
            <p className="font-semibold text-foreground">No open roles right now</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              We're not actively hiring, but we're always interested in exceptional people.
            </p>
            <Button asChild className="mt-6 bg-violet-600 text-white hover:bg-violet-700">
              <Link to="/contact">Send us a message anyway</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
