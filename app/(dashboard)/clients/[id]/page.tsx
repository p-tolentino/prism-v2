/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useClient } from "@/hooks/useClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Pencil, Plus, FileText } from "lucide-react";
import Link from "next/link";
import { ReviewCard } from "@/components/reviews/reviews-card";

export default function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { client, isLoading } = useClient(params.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!client) {
    return <div>Client not found</div>;
  }

  const leadAdvisor = client.assignments?.find((a: any) => a.role === "lead");
  const associateAdvisors = client.assignments?.filter(
    (a: any) => a.role === "associate",
  );
  const cso = client.assignments?.find((a: any) => a.role === "cso");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {client.first_name} {client.last_name}
          </h1>
          <p className="text-gray-500">
            Client since {format(new Date(client.created_at), "MMMM yyyy")}
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/clients/${client.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="decisions">Decision Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {client.email || "Not provided"}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {client.phone || "Not provided"}
                </p>
                <p>
                  <span className="font-medium">Date of Birth:</span>{" "}
                  {client.date_of_birth
                    ? format(new Date(client.date_of_birth), "MMMM d, yyyy")
                    : "Not provided"}
                </p>
                <p>
                  <span className="font-medium">Marital Status:</span>{" "}
                  {client.marital_status || "Not provided"}
                </p>
                <p>
                  <span className="font-medium">Occupation:</span>{" "}
                  {client.occupation || "Not provided"}
                </p>
                <p>
                  <span className="font-medium">Employer:</span>{" "}
                  {client.employer || "Not provided"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent>
                {client.address ? (
                  <div>
                    <p>{client.address}</p>
                    <p>
                      {client.city}, {client.state} {client.postal_code}
                    </p>
                    <p>{client.country}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No address provided</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Assignments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {leadAdvisor && (
                  <div>
                    <p className="text-sm text-gray-500">Lead Advisor</p>
                    <p className="font-medium">
                      {leadAdvisor.profile?.first_name}{" "}
                      {leadAdvisor.profile?.last_name}
                    </p>
                  </div>
                )}

                {associateAdvisors?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Associate Advisors</p>
                    {associateAdvisors.map((a: any) => (
                      <p key={a.id} className="font-medium">
                        {a.profile?.first_name} {a.profile?.last_name}
                      </p>
                    ))}
                  </div>
                )}

                {cso && (
                  <div>
                    <p className="text-sm text-gray-500">CSO</p>
                    <p className="font-medium">
                      {cso.profile?.first_name} {cso.profile?.last_name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  className={
                    client.status === "active"
                      ? "bg-green-100 text-green-800"
                      : client.status === "inactive"
                        ? "bg-gray-100 text-gray-800"
                        : client.status === "prospect"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                  }
                >
                  {client.status}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Policies</CardTitle>
              <Button asChild size="sm">
                <Link href={`/clients/${client.id}/policies/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Policy
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {client.policies?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No policies added yet
                </p>
              ) : (
                <div className="space-y-4">
                  {client.policies.map((policy: any) => (
                    <Card key={policy.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">
                              {policy.policy_number}
                            </p>
                            <p className="text-sm text-gray-600">
                              {policy.insurer} - {policy.policy_type}
                            </p>
                          </div>
                          <Badge
                            className={
                              policy.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {policy.status}
                          </Badge>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Sum Assured</p>
                            <p className="font-medium">
                              ₱{policy.sum_assured?.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Premium</p>
                            <p className="font-medium">
                              ₱{policy.premium_amount?.toLocaleString()}/
                              {policy.premium_frequency}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Next Review</p>
                            <p className="font-medium">
                              {policy.next_review_date
                                ? format(
                                    new Date(policy.next_review_date),
                                    "MMM d, yyyy",
                                  )
                                : "Not set"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/policies/${policy.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Reviews</CardTitle>
              <Button asChild size="sm">
                <Link href={`/clients/${client.id}/reviews/schedule`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Review
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {client.reviews?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No reviews scheduled
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {client.reviews.map((review: any) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Decision Rationale Log</CardTitle>
              <Button asChild size="sm">
                <Link href={`/clients/${client.id}/decisions/new`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Log Decision
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {client.decision_logs?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No decisions logged
                </p>
              ) : (
                <div className="space-y-4">
                  {client.decision_logs.map((log: any) => (
                    <Card key={log.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{log.decision_type}</p>
                            <p className="text-sm text-gray-600">
                              By {log.creator?.first_name}{" "}
                              {log.creator?.last_name} on{" "}
                              {format(new Date(log.created_at), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm font-medium">Rationale:</p>
                          <p className="text-sm text-gray-700 mt-1">
                            {log.rationale}
                          </p>
                        </div>

                        {log.alternatives_considered?.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium">
                              Alternatives Considered:
                            </p>
                            <ul className="list-disc list-inside mt-1">
                              {log.alternatives_considered.map(
                                (alt: string, i: number) => (
                                  <li key={i} className="text-sm text-gray-700">
                                    {alt}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}

                        {log.client_agreement && (
                          <div className="mt-4">
                            <p className="text-sm font-medium">
                              Client Agreement:
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              {log.client_agreement}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
