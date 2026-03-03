"use server";

import { createClient } from "@/lib/supabase/server";

interface AuditLogData {
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_data?: any;
  new_data?: any;
}

export async function createAuditLog(data: AuditLogData) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("audit_logs").insert({
      ...data,
      user_id: user.id,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
