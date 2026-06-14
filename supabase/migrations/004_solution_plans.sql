-- ============================================================
-- Industrial Copilot MVP 0.3 — Solution Plans Table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.solution_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Solution',
  customer_industry TEXT,
  customer_scenario TEXT NOT NULL,
  budget_preference TEXT,
  brand_preference TEXT,
  extra_requirements TEXT,
  generated_content TEXT NOT NULL,
  referenced_products UUID[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_solution_plans_user_id ON public.solution_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_solution_plans_created_at ON public.solution_plans(created_at DESC);

-- RLS
ALTER TABLE public.solution_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own solutions"
  ON public.solution_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own solutions"
  ON public.solution_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own solutions"
  ON public.solution_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own solutions"
  ON public.solution_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE TRIGGER set_solution_updated_at
  BEFORE UPDATE ON public.solution_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
