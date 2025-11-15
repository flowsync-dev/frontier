-- Create CRM leads/customers table
CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  source TEXT, -- e.g., 'checkout', 'manual', 'import'
  stage TEXT DEFAULT 'acquired', -- 'acquired', 'conversing', 'sold', 'lost'
  notes TEXT,
  total_purchases DECIMAL(10, 2) DEFAULT 0,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create CRM interaction history table
CREATE TABLE IF NOT EXISTS crm_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'email', 'phone', 'whatsapp', 'note'
  content TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create CRM funnel stages table (customizable per store)
CREATE TABLE IF NOT EXISTS crm_funnel_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  order_index INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add WhatsApp number and category to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Add multiple image URLs to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]';

-- Update sales table to link to CRM leads
ALTER TABLE sales ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES crm_leads(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_crm_leads_store_id ON crm_leads(store_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON crm_leads(stage);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_lead_id ON crm_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_funnel_stages_store_id ON crm_funnel_stages(store_id);

-- Enable RLS
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_funnel_stages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crm_leads
CREATE POLICY "Store owners can view their CRM leads" ON crm_leads
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can insert CRM leads" ON crm_leads
  FOR INSERT WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can update their CRM leads" ON crm_leads
  FOR UPDATE USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can delete their CRM leads" ON crm_leads
  FOR DELETE USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for crm_interactions
CREATE POLICY "Store owners can view their CRM interactions" ON crm_interactions
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can insert CRM interactions" ON crm_interactions
  FOR INSERT WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for crm_funnel_stages
CREATE POLICY "Store owners can view their funnel stages" ON crm_funnel_stages
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can manage funnel stages" ON crm_funnel_stages
  FOR ALL USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

-- Insert default funnel stages for existing stores
INSERT INTO crm_funnel_stages (store_id, name, color, order_index, is_default)
SELECT id, 'Acquired', '#10b981', 1, true FROM stores
WHERE NOT EXISTS (SELECT 1 FROM crm_funnel_stages WHERE crm_funnel_stages.store_id = stores.id);

INSERT INTO crm_funnel_stages (store_id, name, color, order_index, is_default)
SELECT id, 'Conversing', '#3b82f6', 2, true FROM stores
WHERE NOT EXISTS (SELECT 1 FROM crm_funnel_stages WHERE crm_funnel_stages.store_id = stores.id AND name = 'Conversing');

INSERT INTO crm_funnel_stages (store_id, name, color, order_index, is_default)
SELECT id, 'Sold', '#8b5cf6', 3, true FROM stores
WHERE NOT EXISTS (SELECT 1 FROM crm_funnel_stages WHERE crm_funnel_stages.store_id = stores.id AND name = 'Sold');

INSERT INTO crm_funnel_stages (store_id, name, color, order_index, is_default)
SELECT id, 'Lost', '#ef4444', 4, true FROM stores
WHERE NOT EXISTS (SELECT 1 FROM crm_funnel_stages WHERE crm_funnel_stages.store_id = stores.id AND name = 'Lost');
