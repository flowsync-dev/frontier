-- Add cost_price and low_stock_level columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS low_stock_level INTEGER DEFAULT 10;

-- Create index for low stock queries
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(stock, low_stock_level)
WHERE stock <= low_stock_level;
