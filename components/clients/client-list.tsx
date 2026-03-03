/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useClients } from "@/hooks/useClients";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { DataTable } from "../ui/data-table";

const columns = [
  {
    accessorKey: "first_name",
    header: "Name",
    cell: ({ row }: any) => (
      <div>
        {row.original.first_name} {row.original.last_name}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.original.status;
      const variants: Record<string, string> = {
        active: "bg-green-100 text-green-800",
        inactive: "bg-gray-100 text-gray-800",
        prospect: "bg-blue-100 text-blue-800",
        former: "bg-red-100 text-red-800",
      };

      return (
        <Badge className={variants[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }: any) =>
      format(new Date(row.original.created_at), "MMM d, yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }: any) => (
      <Button asChild variant="ghost" size="sm">
        <Link href={`/clients/${row.original.id}`}>View</Link>
      </Button>
    ),
  },
];

export function ClientList() {
  const { clients, isLoading } = useClients();

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Clients</h2>
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>

      <DataTable columns={columns} data={clients || []} loading={isLoading} />
    </div>
  );
}
