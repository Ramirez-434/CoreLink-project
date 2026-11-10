import { CatalogGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function SistemasLoading() {
  return (
    <div className="relative overflow-hidden min-h-screen" role="status" aria-busy="true">
      <div className="container relative z-10 mx-auto px-4 py-16 max-w-5xl">
        <div className="flex flex-col items-center mb-16 space-y-4">
          <Skeleton className="h-10 w-72 rounded-xl" />
          <Skeleton className="h-5 w-96 max-w-full rounded-lg" />
        </div>

        <CatalogGridSkeleton count={6} />
      </div>
    </div>
  );
}
