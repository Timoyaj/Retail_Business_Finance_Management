/*
  # Inventory Valuation System

  1. New Tables
    - `inventory_movements`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `movement_type` (text, check constraint)
      - `quantity` (integer)
      - `unit_cost` (numeric)
      - `total_cost` (numeric)
      - `reference_id` (uuid, optional reference)
      - `date` (timestamptz)
      - `notes` (text, optional)
      - `created_at` (timestamptz)

    - `inventory_layers`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer)
      - `unit_cost` (numeric)
      - `total_cost` (numeric)
      - `purchase_date` (timestamptz)
      - `remaining_quantity` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for business owners to manage their inventory data
*/

-- Create inventory_movements table
CREATE TABLE IF NOT EXISTS inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'adjustment', 'transfer')),
  quantity integer NOT NULL,
  unit_cost numeric(10,2) NOT NULL DEFAULT 0,
  total_cost numeric(12,2) NOT NULL DEFAULT 0,
  reference_id uuid,
  date timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create inventory_layers table for FIFO tracking
CREATE TABLE IF NOT EXISTS inventory_layers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  unit_cost numeric(10,2) NOT NULL,
  total_cost numeric(12,2) NOT NULL,
  purchase_date timestamptz NOT NULL,
  remaining_quantity integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(product_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(product_id, movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_layers_product ON inventory_layers(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_layers_purchase_date ON inventory_layers(product_id, purchase_date);
CREATE INDEX IF NOT EXISTS idx_inventory_layers_remaining ON inventory_layers(product_id, remaining_quantity);

-- Enable RLS
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_layers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory_movements
CREATE POLICY "Users can read own business inventory movements"
  ON inventory_movements
  FOR SELECT
  TO authenticated
  USING (product_id IN (
    SELECT p.id FROM products p
    JOIN business_profiles bp ON p.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert inventory movements for own business"
  ON inventory_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (product_id IN (
    SELECT p.id FROM products p
    JOIN business_profiles bp ON p.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own business inventory movements"
  ON inventory_movements
  FOR UPDATE
  TO authenticated
  USING (product_id IN (
    SELECT p.id FROM products p
    JOIN business_profiles bp ON p.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own business inventory movements"
  ON inventory_movements
  FOR DELETE
  TO authenticated
  USING (product_id IN (
    SELECT p.id FROM products p
    JOIN business_profiles bp ON p.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

-- RLS Policies for inventory_layers
CREATE POLICY "Users can read own business inventory layers"
  ON inventory_layers
  FOR SELECT
  TO authenticated
  USING (product_id IN (
    SELECT p.id FROM products p
    JOIN business_profiles bp ON p.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert inventory layers for own business"
  ON inventory_layers
  FOR INSERT
  TO authenticated
  WITH CHECK (product_id IN (
    SELECT p.id FROM products p
    JOIN business_profiles bp ON p.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own business inventory layers"
  ON inventory_layers
  FOR UPDATE
  TO authenticated
  USING (product_id IN (
    SELECT p.id FROM products p
    JOIN business_profiles bp ON p.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own business inventory layers"
  ON inventory_layers
  FOR DELETE
  TO authenticated
  USING (product_id IN (
    SELECT p.id FROM products p
    JOIN business_profiles bp ON p.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

-- Add constraint to ensure remaining_quantity doesn't exceed original quantity
ALTER TABLE inventory_layers 
ADD CONSTRAINT inventory_layers_remaining_check 
CHECK (remaining_quantity >= 0 AND remaining_quantity <= quantity);