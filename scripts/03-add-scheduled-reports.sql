-- Create scheduled_reports table
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
  format TEXT NOT NULL CHECK (format IN ('pdf', 'docx', 'xlsx', 'csv')),
  send_email BOOLEAN DEFAULT TRUE,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  next_send_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for scheduled reports
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_store_id ON scheduled_reports(store_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_send ON scheduled_reports(next_send_at)
WHERE is_active = TRUE;

-- Enable RLS for scheduled_reports
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scheduled_reports
CREATE POLICY "Store owners can view their scheduled reports" ON scheduled_reports
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can insert scheduled reports" ON scheduled_reports
  FOR INSERT WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can update their scheduled reports" ON scheduled_reports
  FOR UPDATE USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can delete their scheduled reports" ON scheduled_reports
  FOR DELETE USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );
