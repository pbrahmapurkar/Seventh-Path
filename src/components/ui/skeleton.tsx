import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/50 ${className}`}
      {...props}
    />
  );
}

// Pre-built skeleton components for common patterns
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-6 shadow-sm ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function SkeletonHabitCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-6 shadow-sm ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="w-8 h-8 rounded-xl" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}

export function SkeletonStats({ className = "" }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-6 ${className}`}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="text-center bg-primary/5 rounded-2xl p-4">
          <Skeleton className="h-8 w-16 mx-auto mb-2" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-card/50">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="w-6 h-6 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTabs({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex gap-3">
        <Skeleton className="h-12 flex-1 rounded-2xl" />
        <Skeleton className="h-12 flex-1 rounded-2xl" />
      </div>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}