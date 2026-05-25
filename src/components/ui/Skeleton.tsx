import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl ${className}`}></div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 flex flex-col justify-between">
      <div>
        <Skeleton className="w-16 h-16 rounded-2xl mb-6" />
        <Skeleton className="w-3/4 h-8 mb-4" />
        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-5/6 h-4 mb-8" />
      </div>
      <div>
        <div className="flex justify-between items-end mb-6">
          <Skeleton className="w-24 h-10" />
          <Skeleton className="w-16 h-4" />
        </div>
        <Skeleton className="w-full h-12 rounded-xl" />
      </div>
    </div>
  );
}
