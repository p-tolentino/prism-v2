import { z } from "zod";

export const decisionSchema = z.object({
  client_id: z.string().uuid(),
  policy_id: z.string().uuid().optional(),
  decision_type: z.string().min(1),
  rationale: z.string().min(10),
  alternatives_considered: z.array(z.string()),
  client_agreement: z.string().optional(),
  recommendations: z.array(z.any()).default([]),
});
