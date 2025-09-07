-- Fix SECURITY DEFINER view issue by making the view work properly
-- Drop and recreate the view without SECURITY DEFINER issues
DROP VIEW IF EXISTS public.zara_cloth_view;

CREATE VIEW public.zara_cloth_view 
WITH (security_invoker = true) AS
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

-- Fix function search path mutable issue
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;