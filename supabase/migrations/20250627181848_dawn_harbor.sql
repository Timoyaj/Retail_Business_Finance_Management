/*
  # Purchase Orders and Stock Movement Tracking

  1. New Tables
    - `suppliers` - Vendor/supplier management
    - `purchase_orders` - Purchase order tracking
    - `purchase_order_items` - Line items for purchase orders
    - `stock_receipts` - Receiving records for purchase orders
    - `stock_receipt_items` - Line items for stock receipts

  2. Security
    - Enable RLS on all new tables
    - Add policies for business-specific access
    - Ensure proper data isolation

  3. Features
    - Complete purchase order workflow
    - Stock receiving with variance tracking
    - Supplier management
    - Purchase order status tracking
*/

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  payment_terms text DEFAULT 'Net 30',
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES suppliers(id),
  po_number text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'partially_received', 'received', 'cancelled')),
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date date,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchase_order_items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL,
  unit_cost numeric(10,2) NOT NULL,
  total_cost numeric(12,2) NOT NULL,
  quantity_received integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create stock_receipts table
CREATE TABLE IF NOT EXISTS stock_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  purchase_order_id uuid REFERENCES purchase_orders(id),
  receipt_number text NOT NULL,
  receipt_date date NOT NULL DEFAULT CURRENT_DATE,
  received_by text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stock_receipt_items table
CREATE TABLE IF NOT EXISTS stock_receipt_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_receipt_id uuid NOT NULL REFERENCES stock_receipts(id) ON DELETE CASCADE,
  purchase_order_item_id uuid REFERENCES purchase_order_items(id),
  product_id uuid NOT NULL REFERENCES products(id),
  quantity_ordered integer DEFAULT 0,
  quantity_received integer NOT NULL,
  unit_cost numeric(10,2) NOT NULL,
  total_cost numeric(12,2) NOT NULL,
  variance_quantity integer GENERATED ALWAYS AS (quantity_received - quantity_ordered) STORED,
  variance_amount numeric(12,2) GENERATED ALWAYS AS ((quantity_received - quantity_ordered) * unit_cost) STORED,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_suppliers_business_id ON suppliers(business_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(business_id, is_active);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_business_id ON purchase_orders(business_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(business_id, status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON purchase_orders(business_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product ON purchase_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_receipts_business_id ON stock_receipts(business_id);
CREATE INDEX IF NOT EXISTS idx_stock_receipts_po ON stock_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_stock_receipts_date ON stock_receipts(business_id, receipt_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_receipt_items_receipt ON stock_receipt_items(stock_receipt_id);
CREATE INDEX IF NOT EXISTS idx_stock_receipt_items_product ON stock_receipt_items(product_id);

-- Add unique constraints
ALTER TABLE suppliers ADD CONSTRAINT suppliers_business_name_unique UNIQUE (business_id, name);
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_business_po_number_unique UNIQUE (business_id, po_number);
ALTER TABLE stock_receipts ADD CONSTRAINT stock_receipts_business_receipt_number_unique UNIQUE (business_id, receipt_number);

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_receipt_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for suppliers
CREATE POLICY "Users can read own business suppliers"
  ON suppliers FOR SELECT TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert suppliers for own business"
  ON suppliers FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own business suppliers"
  ON suppliers FOR UPDATE TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own business suppliers"
  ON suppliers FOR DELETE TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

-- RLS Policies for purchase_orders
CREATE POLICY "Users can read own business purchase orders"
  ON purchase_orders FOR SELECT TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert purchase orders for own business"
  ON purchase_orders FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own business purchase orders"
  ON purchase_orders FOR UPDATE TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own business purchase orders"
  ON purchase_orders FOR DELETE TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

-- RLS Policies for purchase_order_items
CREATE POLICY "Users can read own business purchase order items"
  ON purchase_order_items FOR SELECT TO authenticated
  USING (purchase_order_id IN (
    SELECT po.id FROM purchase_orders po
    JOIN business_profiles bp ON po.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert purchase order items for own business"
  ON purchase_order_items FOR INSERT TO authenticated
  WITH CHECK (purchase_order_id IN (
    SELECT po.id FROM purchase_orders po
    JOIN business_profiles bp ON po.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own business purchase order items"
  ON purchase_order_items FOR UPDATE TO authenticated
  USING (purchase_order_id IN (
    SELECT po.id FROM purchase_orders po
    JOIN business_profiles bp ON po.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own business purchase order items"
  ON purchase_order_items FOR DELETE TO authenticated
  USING (purchase_order_id IN (
    SELECT po.id FROM purchase_orders po
    JOIN business_profiles bp ON po.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

-- RLS Policies for stock_receipts
CREATE POLICY "Users can read own business stock receipts"
  ON stock_receipts FOR SELECT TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert stock receipts for own business"
  ON stock_receipts FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own business stock receipts"
  ON stock_receipts FOR UPDATE TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own business stock receipts"
  ON stock_receipts FOR DELETE TO authenticated
  USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

-- RLS Policies for stock_receipt_items
CREATE POLICY "Users can read own business stock receipt items"
  ON stock_receipt_items FOR SELECT TO authenticated
  USING (stock_receipt_id IN (
    SELECT sr.id FROM stock_receipts sr
    JOIN business_profiles bp ON sr.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert stock receipt items for own business"
  ON stock_receipt_items FOR INSERT TO authenticated
  WITH CHECK (stock_receipt_id IN (
    SELECT sr.id FROM stock_receipts sr
    JOIN business_profiles bp ON sr.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own business stock receipt items"
  ON stock_receipt_items FOR UPDATE TO authenticated
  USING (stock_receipt_id IN (
    SELECT sr.id FROM stock_receipts sr
    JOIN business_profiles bp ON sr.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own business stock receipt items"
  ON stock_receipt_items FOR DELETE TO authenticated
  USING (stock_receipt_id IN (
    SELECT sr.id FROM stock_receipts sr
    JOIN business_profiles bp ON sr.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

-- Add updated_at triggers
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_receipts_updated_at
  BEFORE UPDATE ON stock_receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate PO numbers
CREATE OR REPLACE FUNCTION generate_po_number(business_id_param uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  po_count integer;
  po_number text;
BEGIN
  -- Get count of existing POs for this business
  SELECT COUNT(*) INTO po_count
  FROM purchase_orders
  WHERE business_id = business_id_param;
  
  -- Generate PO number
  po_number := 'PO-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD((po_count + 1)::text, 4, '0');
  
  RETURN po_number;
END;
$$;

-- Function to generate receipt numbers
CREATE OR REPLACE FUNCTION generate_receipt_number(business_id_param uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  receipt_count integer;
  receipt_number text;
BEGIN
  -- Get count of existing receipts for this business
  SELECT COUNT(*) INTO receipt_count
  FROM stock_receipts
  WHERE business_id = business_id_param;
  
  -- Generate receipt number
  receipt_number := 'REC-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD((receipt_count + 1)::text, 4, '0');
  
  RETURN receipt_number;
END;
$$;