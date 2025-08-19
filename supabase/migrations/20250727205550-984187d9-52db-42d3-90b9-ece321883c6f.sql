-- Remove the existing constraint
ALTER TABLE enhanced_overlay_templates 
DROP CONSTRAINT enhanced_overlay_templates_gradient_type_check;

-- Add updated constraint with more gradient types including 'prism'
ALTER TABLE enhanced_overlay_templates 
ADD CONSTRAINT enhanced_overlay_templates_gradient_type_check 
CHECK (gradient_type = ANY (ARRAY['linear'::text, 'radial'::text, 'conic'::text, 'prism'::text, 'diamond'::text, 'square'::text, 'circle'::text]));