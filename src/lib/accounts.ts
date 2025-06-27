import { supabase } from './supabase';
import type { Database } from './supabase';

// Type aliases for Chart of Accounts
export type AccountType = Database['public']['Tables']['account_types']['Row'];
export type Account = Database['public']['Tables']['accounts']['Row'];
export type AccountBalance = Database['public']['Tables']['account_balances']['Row'];

export interface AccountWithType extends Account {
  account_type: AccountType;
  parent_account?: Account;
  sub_accounts?: Account[];
}

export interface ChartOfAccounts {
  assets: AccountWithType[];
  liabilities: AccountWithType[];
  equity: AccountWithType[];
  revenue: AccountWithType[];
  expenses: AccountWithType[];
}

// Chart of Accounts service class
class AccountsService {
  // Get all account types
  async getAccountTypes(): Promise<AccountType[]> {
    const { data, error } = await supabase
      .from('account_types')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // Get accounts for a business with their types
  async getAccountsByBusinessId(businessId: string): Promise<AccountWithType[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select(`
        *,
        account_type:account_types(*),
        parent_account:accounts!parent_account_id(*)
      `)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('code');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // Get chart of accounts organized by type
  async getChartOfAccounts(businessId: string): Promise<ChartOfAccounts> {
    const accounts = await this.getAccountsByBusinessId(businessId);

    const chartOfAccounts: ChartOfAccounts = {
      assets: [],
      liabilities: [],
      equity: [],
      revenue: [],
      expenses: []
    };

    accounts.forEach(account => {
      const typeName = account.account_type.name.toLowerCase();
      switch (typeName) {
        case 'asset':
          chartOfAccounts.assets.push(account);
          break;
        case 'liability':
          chartOfAccounts.liabilities.push(account);
          break;
        case 'equity':
          chartOfAccounts.equity.push(account);
          break;
        case 'revenue':
          chartOfAccounts.revenue.push(account);
          break;
        case 'expense':
          chartOfAccounts.expenses.push(account);
          break;
      }
    });

    return chartOfAccounts;
  }

  // Create a new account
  async createAccount(accountData: Database['public']['Tables']['accounts']['Insert']): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .insert(accountData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Update an account
  async updateAccount(accountId: string, updates: Database['public']['Tables']['accounts']['Update']): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', accountId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Deactivate an account (soft delete)
  async deactivateAccount(accountId: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .update({ is_active: false })
      .eq('id', accountId);

    if (error) {
      throw new Error(error.message);
    }
  }

  // Initialize default chart of accounts for a business
  async initializeDefaultAccounts(businessId: string, businessType: string): Promise<void> {
    const accountTypes = await this.getAccountTypes();
    const typeMap = accountTypes.reduce((map, type) => {
      map[type.name.toLowerCase()] = type.id;
      return map;
    }, {} as Record<string, string>);

    // Default accounts based on business type
    const defaultAccounts = this.getDefaultAccountsForBusinessType(businessType, typeMap);

    // Create accounts
    for (const accountData of defaultAccounts) {
      await this.createAccount({
        ...accountData,
        business_id: businessId,
        is_system: true
      });
    }
  }

  // Get default accounts based on business type
  private getDefaultAccountsForBusinessType(businessType: string, typeMap: Record<string, string>) {
    const baseAccounts = [
      // Assets
      { code: '1000', name: 'Cash', account_type_id: typeMap.asset, description: 'Cash on hand and in bank' },
      { code: '1100', name: 'Accounts Receivable', account_type_id: typeMap.asset, description: 'Money owed by customers' },
      { code: '1200', name: 'Inventory', account_type_id: typeMap.asset, description: 'Products for sale' },
      { code: '1300', name: 'Equipment', account_type_id: typeMap.asset, description: 'Business equipment and fixtures' },
      
      // Liabilities
      { code: '2000', name: 'Accounts Payable', account_type_id: typeMap.liability, description: 'Money owed to suppliers' },
      { code: '2100', name: 'Sales Tax Payable', account_type_id: typeMap.liability, description: 'Sales tax collected' },
      { code: '2200', name: 'Loans Payable', account_type_id: typeMap.liability, description: 'Business loans and credit' },
      
      // Equity
      { code: '3000', name: 'Owner\'s Equity', account_type_id: typeMap.equity, description: 'Owner\'s investment in business' },
      { code: '3100', name: 'Retained Earnings', account_type_id: typeMap.equity, description: 'Accumulated profits' },
      
      // Revenue
      { code: '4000', name: 'Sales Revenue', account_type_id: typeMap.revenue, description: 'Income from product sales' },
      { code: '4100', name: 'Service Revenue', account_type_id: typeMap.revenue, description: 'Income from services' },
      
      // Expenses
      { code: '5000', name: 'Cost of Goods Sold', account_type_id: typeMap.expense, description: 'Direct cost of products sold' },
      { code: '5100', name: 'Rent Expense', account_type_id: typeMap.expense, description: 'Monthly rent payments' },
      { code: '5200', name: 'Utilities Expense', account_type_id: typeMap.expense, description: 'Electricity, water, internet' },
      { code: '5300', name: 'Marketing Expense', account_type_id: typeMap.expense, description: 'Advertising and promotion' },
      { code: '5400', name: 'Office Supplies', account_type_id: typeMap.expense, description: 'Office materials and supplies' },
      { code: '5500', name: 'Professional Services', account_type_id: typeMap.expense, description: 'Legal, accounting, consulting' },
    ];

    // Add business-type specific accounts
    const specificAccounts = this.getBusinessTypeSpecificAccounts(businessType, typeMap);
    
    return [...baseAccounts, ...specificAccounts];
  }

  // Get business-type specific accounts
  private getBusinessTypeSpecificAccounts(businessType: string, typeMap: Record<string, string>) {
    switch (businessType) {
      case 'boutique':
      case 'fashion':
        return [
          { code: '1210', name: 'Clothing Inventory', account_type_id: typeMap.asset, description: 'Clothing and fashion items' },
          { code: '1220', name: 'Accessories Inventory', account_type_id: typeMap.asset, description: 'Fashion accessories' },
          { code: '5600', name: 'Fashion Shows Expense', account_type_id: typeMap.expense, description: 'Fashion events and shows' },
        ];
      
      case 'electronics':
        return [
          { code: '1210', name: 'Electronics Inventory', account_type_id: typeMap.asset, description: 'Electronic devices and gadgets' },
          { code: '1220', name: 'Accessories Inventory', account_type_id: typeMap.asset, description: 'Electronic accessories' },
          { code: '5600', name: 'Warranty Expense', account_type_id: typeMap.expense, description: 'Product warranty costs' },
        ];
      
      case 'grocery':
        return [
          { code: '1210', name: 'Food Inventory', account_type_id: typeMap.asset, description: 'Food and beverage products' },
          { code: '1220', name: 'Non-Food Inventory', account_type_id: typeMap.asset, description: 'Household and personal items' },
          { code: '5600', name: 'Spoilage Expense', account_type_id: typeMap.expense, description: 'Expired or damaged goods' },
        ];
      
      case 'pharmacy':
        return [
          { code: '1210', name: 'Prescription Inventory', account_type_id: typeMap.asset, description: 'Prescription medications' },
          { code: '1220', name: 'OTC Inventory', account_type_id: typeMap.asset, description: 'Over-the-counter products' },
          { code: '5600', name: 'Regulatory Compliance', account_type_id: typeMap.expense, description: 'Licensing and compliance costs' },
        ];
      
      case 'cafe':
      case 'restaurant':
        return [
          { code: '1210', name: 'Food Inventory', account_type_id: typeMap.asset, description: 'Food ingredients and supplies' },
          { code: '1220', name: 'Beverage Inventory', account_type_id: typeMap.asset, description: 'Drinks and beverages' },
          { code: '5600', name: 'Food Waste Expense', account_type_id: typeMap.expense, description: 'Spoiled or wasted food' },
        ];
      
      default:
        return [
          { code: '1210', name: 'Product Inventory A', account_type_id: typeMap.asset, description: 'Primary product category' },
          { code: '1220', name: 'Product Inventory B', account_type_id: typeMap.asset, description: 'Secondary product category' },
        ];
    }
  }

  // Get account balance for a specific period
  async getAccountBalance(accountId: string, periodStart: string, periodEnd: string): Promise<AccountBalance | null> {
    const { data, error } = await supabase
      .from('account_balances')
      .select('*')
      .eq('account_id', accountId)
      .eq('period_start', periodStart)
      .eq('period_end', periodEnd)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return data;
  }

  // Update or create account balance for a period
  async updateAccountBalance(
    accountId: string,
    periodStart: string,
    periodEnd: string,
    balanceData: Partial<AccountBalance>
  ): Promise<AccountBalance> {
    const existingBalance = await this.getAccountBalance(accountId, periodStart, periodEnd);

    if (existingBalance) {
      const { data, error } = await supabase
        .from('account_balances')
        .update(balanceData)
        .eq('id', existingBalance.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } else {
      const { data, error } = await supabase
        .from('account_balances')
        .insert({
          account_id: accountId,
          period_start: periodStart,
          period_end: periodEnd,
          ...balanceData
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    }
  }
}

// Export singleton instance
export const accountsService = new AccountsService();