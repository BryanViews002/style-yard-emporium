import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </Card>
  );
};

export default ProductCardSkeleton;