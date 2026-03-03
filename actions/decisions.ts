"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAuditLog } from "./audit";

const decisionSchema = z.object({
  client_id: z.string().uuid(),
  policy_id: z.string().uuid().optional(),
  decision_type: z.string(),
  rationale: z.string().min(10),
  alternatives_considered: z.array(z.string()),
  client_agreement: z.string().optional(),
  recommendations: z.array(z.any()).default([]),
});

export async function logDecision(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const validatedFields = decisionSchema.safeParse({
    client_id: formData.get("client_id"),
    policy_id: formData.get("policy_id"),
    decision_type: formData.get("decision_type"),
    rationale: formData.get("rationale"),
    alternatives_considered: JSON.parse(
      (formData.get("alternatives_considered") as string) || "[]",
    ),
    client_agreement: formData.get("client_agreement"),
    recommendations: JSON.parse(
      (formData.get("recommendations") as string) || "[]",
    ),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten() };
  }

  const { data: decision, error } = await supabase
    .from("decision_logs")
    .insert({
      ...validatedFields.data,
      created_by: user.id,
    })
    .select(
      `
      *,
      creator:profiles(*)
    `,
    )
    .single();

  if (error) {
    return { error: error.message };
  }

  await createAuditLog({
    action: "LOG_DECISION",
    entity_type: "decision_log",
    entity_id: decision.id,
    new_data: decision,
  });

  revalidatePath(`/clients/${validatedFields.data.client_id}`);
  return { success: true, decision };
}

export async function getClientDecisionLogs(clientId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("decision_logs")
    .select(
      `
      *,
      creator:profiles(*),
      policy:policies(*)
    `,
    )
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
