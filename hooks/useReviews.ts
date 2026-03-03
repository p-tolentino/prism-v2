import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

export function useReviews() {
  const fetcher = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        client:clients(*),
        conductor:profiles(*)
      `,
      )
      .order("scheduled_date");

    if (error) throw error;
    return data;
  };

  const { data, error, isLoading, mutate } = useSWR("reviews", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    reviews: data,
    isLoading,
    error,
    mutate,
  };
}
