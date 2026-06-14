-- ============================================================
-- Industrial Copilot MVP 0.2 — Business Data Tables
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. brands
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  source_note TEXT NOT NULL DEFAULT 'platform seed data',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view brands"
  ON public.brands FOR SELECT
  USING (true);

-- 2. product_categories
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.product_categories(id),
  brand_id UUID REFERENCES public.brands(id),
  source_note TEXT NOT NULL DEFAULT 'platform seed data',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view product_categories"
  ON public.product_categories FOR SELECT
  USING (true);

-- 3. products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id),
  category_id UUID NOT NULL REFERENCES public.product_categories(id),
  series TEXT NOT NULL,
  model TEXT NOT NULL,
  name TEXT,
  description TEXT,
  source_type TEXT NOT NULL DEFAULT 'platform' CHECK (source_type IN ('platform','org')),
  source_note TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_model_search ON public.products USING gin (model gin_trgm_ops);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view products"
  ON public.products FOR SELECT
  USING (true);

-- 4. product_attributes (EAV for flexible specs per category)
CREATE TABLE IF NOT EXISTS public.product_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  attr_group TEXT NOT NULL,
  attr_name TEXT NOT NULL,
  attr_value TEXT NOT NULL,
  source_note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_attrs_product ON public.product_attributes(product_id);
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view product_attributes"
  ON public.product_attributes FOR SELECT
  USING (true);

-- 5. sales_knowledge
CREATE TABLE IF NOT EXISTS public.sales_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_tags TEXT[] DEFAULT '{}',
  brand_id UUID REFERENCES public.brands(id),
  source_type TEXT NOT NULL DEFAULT 'internal' CHECK (source_type IN ('official','internal','experience')),
  source_note TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sk_tags ON public.sales_knowledge USING gin (category_tags);
CREATE INDEX IF NOT EXISTS idx_sk_content_search ON public.sales_knowledge USING gin (content gin_trgm_ops);
ALTER TABLE public.sales_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view sales_knowledge"
  ON public.sales_knowledge FOR SELECT
  USING (true);
