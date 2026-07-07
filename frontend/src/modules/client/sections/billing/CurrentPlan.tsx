import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { UsageMeter } from "../../components/UsageMeter";
import { placeholderPlan, placeholderUsage } from "../../placeholder";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function CurrentPlan() {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          {placeholderPlan.name} plan
          <Badge variant="emerald">{placeholderPlan.status}</Badge>
        </CardTitle>
        <CardDescription>
          {placeholderPlan.priceMonthly === 0
            ? "No cost — upgrade any time."
            : `$${(placeholderPlan.priceMonthly / 100).toFixed(0)} / month`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        <UsageMeter
          label="Generations this period"
          used={placeholderUsage.generationsUsed}
          limit={placeholderUsage.generationLimit}
        />
        <UsageMeter
          label="Repositories analyzed"
          used={placeholderUsage.reposAnalyzed}
          limit={placeholderUsage.repoLimit}
        />
      </CardContent>

      <CardFooter className="border-t text-sm text-muted-foreground">
        Usage resets on {formatDate(placeholderUsage.periodEnd)}.
      </CardFooter>
    </Card>
  );
}
