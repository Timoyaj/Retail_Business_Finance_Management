/*
  # Chart of Accounts System

  1. New Tables
    - `account_types`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Asset, Liability, Equity, Revenue, Expense
      - `description` (text)
      - `normal_balance` (text) - debit or credit
      - `created_at` (timestamp)
    
    - `accounts`
      - `id` (uuid, primary key)
      - `business_id` (uuid, foreign key)
      - `account_type_id` (uuid, foreign key)
      - `code` (text) - account number/code
      - `name` (text) - account name
      - `description` (text, optional)
      - `parent_account_id` (uuid, optional) - for sub-accounts
      - `is_active` (boolean, default true)
      - `is_system` (boolean, default false) - system-generated accounts
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `account_balances`
      - `id` (uuid, primary key)
      - `account_id` (uuid, foreign key)
      - `period_start` (date)
      - `period_end` (date)
      - `opening_balance` (numeric)
      - `closing_balance` (numeric)
      - `total_debits` (numeric)
      - `total_credits` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for business owners to manage their accounts
    - Ensure account types are readable by all authenticated users

  3. Indexes
    - Add indexes for business_id, account_type_id, and code for performance
    - Add unique constraint on business_id + code combination
*/

-- Create account types table (system-wide, not business-specific)
CREATE TABLE IF NOT EXISTS account_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  normal_balance text NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
  created_at timestamptz DEFAULT now()
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  account_type_id uuid NOT NULL REFERENCES account_types(id),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  parent_account_id uuid REFERENCES accounts(id),
  is_active boolean DEFAULT true,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create account balances table for period tracking
CREATE TABLE IF NOT EXISTS account_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  opening_balance numeric(15,2) DEFAULT 0,
  closing_balance numeric(15,2) DEFAULT 0,
  total_debits numeric(15,2) DEFAULT 0,
  total_credits numeric(15,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_business_id ON accounts(business_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(account_type_id);
CREATE INDEX IF NOT EXISTS idx_accounts_code ON accounts(business_id, code);
CREATE INDEX IF NOT EXISTS idx_accounts_parent ON accounts(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_account_balances_account ON account_balances(account_id);
CREATE INDEX IF NOT EXISTS idx_account_balances_period ON account_balances(period_start, period_end);

-- Add unique constraint for business + code combination
ALTER TABLE accounts ADD CONSTRAINT accounts_business_code_unique UNIQUE (business_id, code);

-- Add unique constraint for account balances per period
ALTER TABLE account_balances ADD CONSTRAINT account_balances_period_unique UNIQUE (account_id, period_start, period_end);

-- Enable RLS
ALTER TABLE account_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for account_types (readable by all authenticated users)
CREATE POLICY "Account types are readable by authenticated users"
  ON account_types
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for accounts
CREATE POLICY "Users can read own business accounts"
  ON accounts
  FOR SELECT
  TO authenticated
  USING (business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert accounts for own business"
  ON accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own business accounts"
  ON accounts
  FOR UPDATE
  TO authenticated
  USING (business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own business accounts"
  ON accounts
  FOR DELETE
  TO authenticated
  USING (business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  ));

-- RLS Policies for account_balances
CREATE POLICY "Users can read own business account balances"
  ON account_balances
  FOR SELECT
  TO authenticated
  USING (account_id IN (
    SELECT a.id FROM accounts a
    JOIN business_profiles bp ON a.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert account balances for own business"
  ON account_balances
  FOR INSERT
  TO authenticated
  WITH CHECK (account_id IN (
    SELECT a.id FROM accounts a
    JOIN business_profiles bp ON a.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own business account balances"
  ON account_balances
  FOR UPDATE
  TO authenticated
  USING (account_id IN (
    SELECT a.id FROM accounts a
    JOIN business_profiles bp ON a.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  ));

-- Add updated_at trigger for accounts
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert standard account types
INSERT INTO account_types (name, description, normal_balance) VALUES
  ('Asset', 'Resources owned by the business', 'debit'),
  ('Liability', 'Debts and obligations of the business', 'credit'),
  ('Equity', 'Owner''s interest in the business', 'credit'),
  ('Revenue', 'Income generated from business operations', 'credit'),
  ('Expense', 'Costs incurred in business operations', 'debit')
ON CONFLICT (name) DO NOTHING;