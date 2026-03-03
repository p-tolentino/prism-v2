import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

export function useDashboard() {
  const fetcher = async () => {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Get counts
    const [
      { count: totalClients },
      { count: activeClients },
      { count: dueReviews },
      { count: upcomingReviews },
      { data: recentActivities },
    ] = await Promise.all([
      supabase.from("clients").select("*", { count: "exact", head: true }),
      supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("status", "overdue"),
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("status", "scheduled"),
      supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    return {
      profile,
      stats: {
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        dueReviews: dueReviews || 0,
        upcomingReviews: upcomingReviews || 0,
      },
      recentActivities,
    };
  };

  const { data, error, isLoading, mutate } = useSWR("dashboard", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    dashboard: data,
    isLoading,
    error,
    mutate,
  };
}
