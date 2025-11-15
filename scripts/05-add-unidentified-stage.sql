-- Add "unidentified" stage to all stores
-- This stage is for leads created automatically from checkouts before customer details are confirmed

DO $$
DECLARE
  store_record RECORD;
BEGIN
  FOR store_record IN SELECT id FROM stores LOOP
    -- Check if unidentified stage already exists
    IF NOT EXISTS (
      SELECT 1 FROM crm_funnel_stages 
      WHERE store_id = store_record.id 
      AND LOWER(name) = 'unidentified'
    ) THEN
      -- Insert unidentified stage as the first stage (order_index = 0)
      -- Shift existing stages up by 1
      UPDATE crm_funnel_stages 
      SET order_index = order_index + 1 
      WHERE store_id = store_record.id;
      
      INSERT INTO crm_funnel_stages (store_id, name, color, order_index)
      VALUES (store_record.id, 'Unidentified', '#9ca3af', 0);
    END IF;
  END LOOP;
END $$;
