import { z } from "zod";

export const reviewSchema = z.object({
  client_id: z.string().uuid(),
  review_type: z.enum(["annual_policy", "biennial_wealth", "event_based"]),
  scheduled_date: z.string(),
  notes: z.string().optional(),
});

export const completeReviewSchema = z.object({
  findings: z.string().min(10),
  action_items: z.array(
    z.object({
      description: z.string(),
      assigned_to: z.string().optional(),
      due_date: z.string().optional(),
    }),
  ),
  next_review_date: z.string().optional(),
});
