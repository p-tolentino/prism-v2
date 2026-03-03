/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { dashboard, isLoading } = useDashboard();

  const stats = [
    {
      title: "Total Clients",
      value: dashboard?.stats.totalClients || 0,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Active Clients",
      value: dashboard?.stats.activeClients || 0,
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      title: "Due Reviews",
      value: dashboard?.stats.dueReviews || 0,
      icon: Clock,
      color: "bg-red-500",
    },
    {
      title: "Upcoming Reviews",
      value: dashboard?.stats.upcomingReviews || 0,
      icon: Calendar,
      color: "bg-yellow-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg ${stat.color} p-2 text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.recentActivities?.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No recent activity
              </p>
            ) : (
              <div className="space-y-4">
                {dashboard?.recentActivities?.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 text-sm"
                  >
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="flex-1">{activity.action}</span>
                    <span className="text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Welcome, {dashboard?.profile?.first_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You are logged in as{" "}
              <span className="font-medium">{dashboard?.profile?.role}</span>
            </p>
            <p className="text-gray-600 mt-2">
              Last login:{" "}
              {dashboard?.profile?.last_login
                ? new Date(dashboard.profile.last_login).toLocaleString()
                : "First time"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
