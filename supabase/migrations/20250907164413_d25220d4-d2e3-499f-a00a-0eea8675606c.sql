-- 1) Create canonical catalog_items table
CREATE TABLE IF NOT EXISTS public.catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (char_length(source) > 0),
  source_product_id text NOT NULL,
  brand text,
  title text,
  url text,
  price numeric(12,2),
  currency text,
  available boolean,
  color text,
  sizes jsonb,        -- [{ size: string, available: boolean, sku?: string }]
  images jsonb,       -- ["https://..."]
  category text,
  gender text,
  materials text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint/index for (source, source_product_id)
CREATE UNIQUE INDEX IF NOT EXISTS catalog_items_source_product_unique 
  ON public.catalog_items (source, source_product_id);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_catalog_items_source ON public.catalog_items(source);
CREATE INDEX IF NOT EXISTS idx_catalog_items_category ON public.catalog_items(category);
CREATE INDEX IF NOT EXISTS idx_catalog_items_gender ON public.catalog_items(gender);
CREATE INDEX IF NOT EXISTS idx_catalog_items_available ON public.catalog_items(available);

-- Ensure JSON arrays for sizes/images (optional safety)
ALTER TABLE public.catalog_items
  ADD CONSTRAINT catalog_items_sizes_array_chk CHECK (sizes IS NULL OR jsonb_typeof(sizes) = 'array');
ALTER TABLE public.catalog_items
  ADD CONSTRAINT catalog_items_images_array_chk CHECK (images IS NULL OR jsonb_typeof(images) = 'array');

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_catalog_items ON public.catalog_items;
CREATE TRIGGER set_updated_at_catalog_items
BEFORE UPDATE ON public.catalog_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: enable and allow public read-only
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'catalog_items' AND policyname = 'Allow public read access to catalog_items'
  ) THEN
    CREATE POLICY "Allow public read access to catalog_items"
      ON public.catalog_items
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- 2) VIEW compatible with zara_cloth expected columns
CREATE OR REPLACE VIEW public.zara_cloth_view AS
SELECT
  ci.id::uuid AS id,
  COALESCE(ci.title, '') AS product_name,
  COALESCE(ci.price, 0)::double precision AS price,
  COALESCE(ci.color, '') AS colour,
  NULL::text AS description,
  -- first image url if available
  (
    CASE
      WHEN jsonb_typeof(ci.images) = 'array' AND jsonb_array_length(ci.images) > 0 THEN ci.images->>0
      ELSE NULL
    END
  ) AS image,
  COALESCE(ci.available, true) AS availability,
  -- extract size labels from sizes array
  COALESCE(
    ARRAY(
      SELECT s->>'size'
      FROM jsonb_array_elements(COALESCE(ci.sizes, '[]'::jsonb)) AS s
      WHERE s ? 'size'
    ),
    ARRAY[]::text[]
  ) AS size,
  NULL::text[] AS materials,
  ci.created_at,
  NULL::bigint AS category_id,
  NULL::bigint AS product_id,
  NULL::bigint AS colour_code,
  NULL::jsonb AS care,
  NULL::boolean AS low_on_stock,
  NULL::jsonb AS you_may_also_like,
  NULL::text AS section,
  NULL::text AS product_family,
  NULL::text AS product_family_en,
  NULL::text AS product_subfamily,
  NULL::text AS materials_description,
  NULL::text AS dimension,
  NULL::text AS sku,
  ci.url,
  ci.currency
FROM public.catalog_items ci;