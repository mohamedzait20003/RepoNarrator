import type { FC } from "react";
import { Skeleton } from "@/common/components/ui/skeleton";

export const ContentSkeleton: FC = () => (
  <div className="min-h-full w-full bg-sand-50 px-6 pt-16 space-y-6">
    <div className="flex flex-col items-center gap-3">
      <Skeleton className="w-3/5 h-9 rounded-lg" />
      <Skeleton className="w-2/5 h-9 rounded-lg" />
      <Skeleton className="w-1/2 h-4 rounded-md mt-2" />
    </div>
    <Skeleton className="h-14 rounded-2xl max-w-2xl mx-auto mt-6" />
    <div className="flex gap-3 pt-8">
      <Skeleton className="w-20 h-5 rounded-md" />
      <Skeleton className="w-14 h-5 rounded-full" />
      <Skeleton className="w-13 h-5 rounded-full" />
      <Skeleton className="w-15 h-5 rounded-full" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl overflow-hidden">
          <Skeleton className="h-40 rounded-none" />
          <div className="pt-4 space-y-2">
            <Skeleton className="w-3/4 h-3.5 rounded-md" />
            <Skeleton className="w-2/5 h-3 rounded-md" />
            <Skeleton className="w-1/2 h-3.5 rounded-md" />
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-11 h-11 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-3/4 h-3.5 rounded-md" />
            <Skeleton className="w-1/2 h-2.5 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
