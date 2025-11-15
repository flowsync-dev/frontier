-- Add theme configuration columns to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS theme_preset TEXT DEFAULT 'minimal';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#6366f1';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#8b5cf6';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#ec4899';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS font_heading TEXT DEFAULT 'Inter';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS font_body TEXT DEFAULT 'Inter';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS logo_position TEXT DEFAULT 'center';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS show_banner BOOLEAN DEFAULT true;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS layout_style TEXT DEFAULT 'grid-3';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS card_style TEXT DEFAULT 'elevated';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS button_style TEXT DEFAULT 'rounded';

-- Create index for theme preset lookups
CREATE INDEX IF NOT EXISTS idx_stores_theme_preset ON stores(theme_preset);
