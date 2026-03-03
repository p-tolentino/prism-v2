"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { Calendar, User } from "lucide-react";

interface ReviewCardProps {
  review: any;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            {review.client?.first_name} {review.client?.last_name}
          </CardTitle>
          <Badge className={statusColors[review.status]}>
            {review.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              Scheduled:{" "}
              {format(new Date(review.scheduled_date), "MMM d, yyyy")}
            </span>
          </div>

          {review.conducted_by && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>
                Conducted by: {review.conductor?.first_name}{" "}
                {review.conductor?.last_name}
              </span>
            </div>
          )}

          <div className="pt-2">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href={`/reviews/${review.id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
