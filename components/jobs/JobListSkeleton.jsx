import Skeleton from "@/components/ui/Skeleton";

// Скелетоны вместо белого экрана, пока «Работа России» отвечает (до 25 секунд)
export default function JobListSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-5 w-48" />
      <div className="card divide-y divide-line">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="flex flex-col gap-2 px-4 py-4 sm:px-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-6 w-36" />
          </div>
        ))}
      </div>
    </div>
  );
}
