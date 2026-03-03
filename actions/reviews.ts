"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createNotification } from "./notifications";
import { createAuditLog } from "./audit";

const reviewSchema = z.object({
  client_id: z.string().uuid(),
  review_type: z.enum(["annual_policy", "biennial_wealth", "event_based"]),
  scheduled_date: z.string(),
  notes: z.string().optional(),
});

export async function scheduleReview(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const validatedFields = reviewSchema.safeParse({
    client_id: formData.get("client_id"),
    review_type: formData.get("review_type"),
    scheduled_date: formData.get("scheduled_date"),
    notes: formData.get("notes"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten() };
  }

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      ...validatedFields.data,
      status: "scheduled",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Get assigned advisors for notification
  const { data: assignments } = await supabase
    .from("client_assignments")
    .select("profile_id")
    .eq("client_id", validatedFields.data.client_id);

  // Notify assigned advisors
  for (const assignment of assignments || []) {
    await createNotification({
      user_id: assignment.profile_id,
      title: "New Review Scheduled",
      message: `A ${validatedFields.data.review_type.replace("_", " ")} review has been scheduled for ${new Date(validatedFields.data.scheduled_date).toLocaleDateString()}`,
      type: "review_due",
      link: `/reviews/${review.id}`,
    });
  }

  await createAuditLog({
    action: "SCHEDULE_REVIEW",
    entity_type: "review",
    entity_id: review.id,
    new_data: review,
  });

  revalidatePath(`/clients/${validatedFields.data.client_id}`);
  revalidatePath("/reviews");
  return { success: true, review };
}

export async function completeReview(
  id: string,
  data: {
    findings: string;
    action_items: any[];
    next_review_date?: string;
  },
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: review, error } = await supabase
    .from("reviews")
    .update({
      status: "completed",
      completed_date: new Date().toISOString(),
      conducted_by: user.id,
      findings: data.findings,
      action_items: data.action_items,
      next_review_date: data.next_review_date,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  await createAuditLog({
    action: "COMPLETE_REVIEW",
    entity_type: "review",
    entity_id: id,
    new_data: review,
  });

  revalidatePath(`/reviews/${id}`);
  revalidatePath("/reviews");
  return { success: true, review };
}

export async function getDueReviews() {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      client:clients(*),
      conductor:profiles(*)
    `,
    )
    .eq("status", "scheduled")
    .lte("scheduled_date", today)
    .order("scheduled_date");

  if (error) throw error;
  return data;
}

export async function getUpcomingReviews(days: number = 30) {
  const supabase = await createClient();

  const today = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      client:clients(*),
      conductor:profiles(*)
    `,
    )
    .eq("status", "scheduled")
    .gte("scheduled_date", today.toISOString().split("T")[0])
    .lte("scheduled_date", future.toISOString().split("T")[0])
    .order("scheduled_date");

  if (error) throw error;
  return data;
}
