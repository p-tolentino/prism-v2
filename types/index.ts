export type UserRole =
  | "system_admin"
  | "senior_advisor"
  | "lead_advisor"
  | "associate_advisor"
  | "cso"
  | "read_only";

export type AssignmentRole = "lead" | "associate" | "cso";
export type ClientStatus = "active" | "inactive" | "prospect" | "former";
export type ReviewType = "annual_policy" | "biennial_wealth" | "event_based";
export type ReviewStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "overdue"
  | "cancelled";
export type PolicyStatus =
  | "active"
  | "lapsed"
  | "matured"
  | "pending"
  | "cancelled";

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  occupation?: string;
  employer?: string;
  marital_status?: string;
  spouse_name?: string;
  spouse_dob?: string;
  dependents: Dependent[];
  financial_goals: FinancialGoal[];
  planning_assumptions: PlanningAssumptions;
  notes?: string;
  status: ClientStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Dependent {
  name: string;
  relationship: string;
  date_of_birth: string;
}

export interface FinancialGoal {
  id: string;
  description: string;
  target_amount?: number;
  target_date?: string;
  priority: "high" | "medium" | "low";
}

export interface PlanningAssumptions {
  inflation_rate?: number;
  investment_return?: number;
  retirement_age?: number;
  life_expectancy?: number;
  risk_tolerance?: "conservative" | "moderate" | "aggressive";
}

export interface ClientAssignment {
  id: string;
  client_id: string;
  profile_id: string;
  role: AssignmentRole;
  assigned_by: string;
  assigned_at: string;
  profile?: Profile;
}

export interface Policy {
  id: string;
  client_id: string;
  policy_number: string;
  insurer: string;
  policy_type: string;
  product_name?: string;
  sum_assured?: number;
  premium_amount?: number;
  premium_frequency?: string;
  start_date?: string;
  maturity_date?: string;
  next_review_date?: string;
  status: PolicyStatus;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  client_id: string;
  review_type: ReviewType;
  scheduled_date: string;
  completed_date?: string;
  status: ReviewStatus;
  conducted_by?: string;
  findings?: string;
  action_items: ActionItem[];
  next_review_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
  conductor?: Profile;
}

export interface ActionItem {
  id: string;
  description: string;
  assigned_to?: string;
  due_date?: string;
  status: "pending" | "completed" | "overdue";
}

export interface DecisionLog {
  id: string;
  client_id: string;
  policy_id?: string;
  decision_type: string;
  rationale: string;
  alternatives_considered: string[];
  client_agreement?: string;
  recommendations: any[];
  created_by: string;
  created_at: string;
  creator?: Profile;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: Profile;
}
