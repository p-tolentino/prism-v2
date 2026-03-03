"use server";

import { createClient } from "@/lib/supabase/server";

interface NotificationData {
  user_id: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error" | "review_due" | "assignment";
  link?: string;
}

export async function createNotification(data: NotificationData) {
  const supabase = await createClient();

  try {
    await supabase.from("notifications").insert({
      ...data,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

export async function markNotificationAsRead(id: string) {
  const supabase = await createClient();

  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);
}
