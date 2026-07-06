import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";

export interface PlanCardProps {
  name: string;
  price: string;
  period?: string;
  desc: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  popular?: boolean;
}

export function PlanCard({
  name,
  price,
  period,
  desc,
  features,
  cta,
  highlight = false,
  popular = false,
}: PlanCardProps) {
  return (
    <Card
      className={
        highlight
          ? "relative border-violet-400 bg-violet-600 text-white shadow-xl shadow-violet-500/20 ring-violet-400/40"
          : "relative"
      }
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="emerald" className="shadow-sm">
            Most popular
          </Badge>
        </div>
      )}

      <CardHeader>
        <p
          className={`text-xs font-semibold uppercase tracking-wider ${
            highlight ? "text-violet-200" : "text-muted-foreground"
          }`}
        >
          {name}
        </p>
        <div className="flex items-baseline gap-1 pt-1">
          <CardTitle
            className={`text-4xl font-extrabold ${highlight ? "text-white" : "text-foreground"}`}
          >
            {price}
          </CardTitle>
          {period && (
            <span
              className={`text-sm ${highlight ? "text-violet-200" : "text-muted-foreground"}`}
            >
              {period}
            </span>
          )}
        </div>
        <CardDescription className={highlight ? "text-violet-100" : undefined}>
          {desc}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-2.5">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <CheckCircle2
                className={`h-4 w-4 shrink-0 ${highlight ? "text-violet-200" : "text-emerald-500"}`}
              />
              <span className={highlight ? "text-violet-100" : "text-foreground"}>{f}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          asChild
          className={`w-full ${
            highlight
              ? "bg-white text-violet-700 hover:bg-violet-50"
              : "bg-violet-600 text-white hover:bg-violet-700"
          }`}
          size="lg"
        >
          <Link to="/auth/sign-up">{cta}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
