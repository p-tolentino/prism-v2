"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAuditLog } from "./audit";

const clientSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default("Philippines"),
  occupation: z.string().optional(),
  employer: z.string().optional(),
  marital_status: z.string().optional(),
  spouse_name: z.string().optional(),
  spouse_dob: z.string().optional(),
  dependents: z
    .array(
      z.object({
        name: z.string(),
        relationship: z.string(),
        date_of_birth: z.string(),
      }),
    )
    .default([]),
  financial_goals: z
    .array(
      z.object({
        id: z.string(),
        description: z.string(),
        target_amount: z.number().optional(),
        target_date: z.string().optional(),
        priority: z.enum(["high", "medium", "low"]),
      }),
    )
    .default([]),
  planning_assumptions: z
    .object({
      inflation_rate: z.number().optional(),
      investment_return: z.number().optional(),
      retirement_age: z.number().optional(),
      life_expectancy: z.number().optional(),
      risk_tolerance: z
        .enum(["conservative", "moderate", "aggressive"])
        .optional(),
    })
    .default({}),
  notes: z.string().optional(),
  status: z
    .enum(["active", "inactive", "prospect", "former"])
    .default("active"),
});

export async function createClient(formData: FormData) {
  const supabase = await createServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Parse form data to JSON
  const rawData = Object.fromEntries(formData);

  // Parse JSON fields
  const data = {
    ...rawData,
    dependents: rawData.dependents
      ? JSON.parse(rawData.dependents as string)
      : [],
    financial_goals: rawData.financial_goals
      ? JSON.parse(rawData.financial_goals as string)
      : [],
    planning_assumptions: rawData.planning_assumptions
      ? JSON.parse(rawData.planning_assumptions as string)
      : {},
  };

  const validatedFields = clientSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten() };
  }

  // Insert client
  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      ...validatedFields.data,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Create audit log
  await createAuditLog({
    action: "CREATE_CLIENT",
    entity_type: "client",
    entity_id: client.id,
    new_data: client,
  });

  revalidatePath("/clients");
  return { success: true, client };
}

export async function getClients() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get user profile for role check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let query = supabase
    .from("clients")
    .select(
      `
      *,
      assignments:client_assignments(
        *,
        profile:profiles(*)
      )
    `,
    )
    .order("created_at", { ascending: false });

  // If not admin/senior, filter by assignments
  if (
    !["system_admin", "senior_advisor", "read_only"].includes(profile?.role)
  ) {
    const { data: assignments } = await supabase
      .from("client_assignments")
      .select("client_id")
      .eq("profile_id", user.id);

    const clientIds = assignments?.map((a) => a.client_id) || [];
    query = query.in("id", clientIds);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getClient(id: string) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("clients")
    .select(
      `
      *,
      assignments:client_assignments(
        *,
        profile:profiles(*)
      ),
      policies(*),
      reviews(*),
      decision_logs(
        *,
        creator:profiles(*)
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateClient(id: string, formData: FormData) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get existing data for audit
  const { data: existing } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  const rawData = Object.fromEntries(formData);

  const data = {
    ...rawData,
    dependents: rawData.dependents
      ? JSON.parse(rawData.dependents as string)
      : existing?.dependents,
    financial_goals: rawData.financial_goals
      ? JSON.parse(rawData.financial_goals as string)
      : existing?.financial_goals,
    planning_assumptions: rawData.planning_assumptions
      ? JSON.parse(rawData.planning_assumptions as string)
      : existing?.planning_assumptions,
  };

  const validatedFields = clientSchema.partial().safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten() };
  }

  const { data: client, error } = await supabase
    .from("clients")
    .update({
      ...validatedFields.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Create audit log
  await createAuditLog({
    action: "UPDATE_CLIENT",
    entity_type: "client",
    entity_id: id,
    old_data: existing,
    new_data: client,
  });

  revalidatePath(`/clients/${id}`);
  revalidatePath("/clients");
  return { success: true, client };
}

export async function assignClient(data: {
  client_id: string;
  profile_id: string;
  role: "lead" | "associate" | "cso";
}) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("client_assignments").insert({
    ...data,
    assigned_by: user.id,
  });

  if (error) {
    // Check if duplicate (already assigned)
    if (error.code === "23505") {
      return { error: "User already assigned to this client with this role" };
    }
    return { error: error.message };
  }

  await createAuditLog({
    action: "ASSIGN_CLIENT",
    entity_type: "client_assignment",
    entity_id: `${data.client_id}_${data.profile_id}_${data.role}`,
    new_data: data,
  });

  revalidatePath(`/clients/${data.client_id}`);
  return { success: true };
}

export async function removeAssignment(assignmentId: string) {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("client_assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) {
    return { error: error.message };
  }

  await createAuditLog({
    action: "REMOVE_ASSIGNMENT",
    entity_type: "client_assignment",
    entity_id: assignmentId,
  });

  revalidatePath("/clients");
  return { success: true };
}
