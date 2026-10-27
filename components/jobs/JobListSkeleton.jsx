import Skeleton from "@/components/ui/Skeleton";

// Скелетоны вместо белого экрана, пока «Работа России» отвечает (до 25 секунд)
export default function JobListSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-5 w-40" />
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      ))}
    </div>
  );
}
