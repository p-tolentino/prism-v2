import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

export function useClient(id: string) {
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
  };

  const { data, error, isLoading, mutate } = useSWR(
    id ? `client-${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    client: data,
    isLoading,
    error,
    mutate,
  };
}
