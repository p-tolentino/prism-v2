import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientList } from "@/components/clients/client-list";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-96" />}>
        <ClientList />
      </Suspense>
    </div>
  );
}
