import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

const fetcher = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
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

  if (error) throw error;
  return data;
};

export function useClients() {
  const { data, error, isLoading, mutate } = useSWR("clients", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    clients: data,
    isLoading,
    error,
    mutate,
  };
}
