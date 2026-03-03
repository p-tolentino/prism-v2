import { z } from "zod";

export const policySchema = z.object({
  client_id: z.string().uuid(),
  policy_number: z.string().min(1),
  insurer: z.string().min(1),
  policy_type: z.string().min(1),
  product_name: z.string().optional(),
  sum_assured: z.number().positive().optional(),
  premium_amount: z.number().positive().optional(),
  premium_frequency: z
    .enum(["monthly", "quarterly", "semi-annual", "annual", "single"])
    .optional(),
  start_date: z.string().optional(),
  maturity_date: z.string().optional(),
  next_review_date: z.string().optional(),
  status: z
    .enum(["active", "lapsed", "matured", "pending", "cancelled"])
    .default("active"),
  notes: z.string().optional(),
});
