import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

export function useNotifications() {
  const supabase = createClient();

  const fetcher = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  };

  const { data, error, isLoading, mutate } = useSWR("notifications", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);

    mutate();
  };

  const markAllAsRead = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    mutate();
  };

  return {
    notifications: data,
    unreadCount: data?.filter((n) => !n.is_read).length || 0,
    isLoading,
    error,
    mutate,
    markAsRead,
    markAllAsRead,
  };
}
