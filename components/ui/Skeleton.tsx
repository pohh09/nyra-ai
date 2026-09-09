'use client';

import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-sky-500/10 border border-sky-400/10 ${className}`}
      {...props}
    />
  );
}

export function ConversationListSkeleton() {
  return (
    <div className="space-y-2 p-2 w-full">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02]">
          <Skeleton className="h-4 w-4 rounded-md" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-3/4 rounded" />
            <Skeleton className="h-2 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="space-y-4 py-4 max-w-3xl mx-auto w-full">
      {/* User message skeleton */}
      <div className="flex justify-end">
        <Skeleton className="h-12 w-64 rounded-2xl" />
      </div>
      {/* Assistant message skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
      </div>
    </div>
  );
}
