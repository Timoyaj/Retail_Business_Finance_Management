import { supabase } from './supabase';
import { accountsService, type AccountWithType, type ChartOfAccounts } from './accounts';
import type { Transaction } from './database';

export interface ProfitLossStatement {
  period: {
    start: string;
    end: string;
  };
  revenue: {
    total: number;
    accounts: Array<{
      account: AccountWithType;
      amount: number;
    }>;
  };
  expenses: {
    total: number;
    accounts: Array<{
      account: AccountWithType;
      amount: number;
    }>;
  };
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  netIncome: number;
  grossProfitMargin: number;
  netProfitMargin: number;
}

export interface BalanceSheet {
  asOfDate: string;
  assets: {
    current: Array<{
      account: AccountWithType;
      amount: number;
    }>;
    nonCurrent: Array<{
      account: AccountWithType;
      amount: number;
    }>;
    totalCurrent: number;
    totalNonCurrent: number;
    total: number;
  };
  liabilities: {
    current: Array<{
      account: AccountWithType;
      amount: number;
    }>;
    nonCurrent: Array<{
      account: AccountWithType;
      amount: number;
    }>;
    totalCurrent: number;
    totalNonCurrent: number;
    total: number;
  };
  equity: {
    accounts: Array<{
      account: AccountWithType;
      amount: number;
    }>;
    total: number;
  };
  totalLiabilitiesAndEquity: number;
}

export interface CashFlowStatement {
  period: {
    start: string;
    end: string;
  };
  operatingActivities: {
    netIncome: number;
    adjustments: Array<{
      description: string;
      amount: number;
    }>;
    workingCapitalChanges: Array<{
      description: string;
      amount: number;
    }>;
    total: number;
  };
  investingActivities: {
    activities: Array<{
      description: string;
      amount: number;
    }>;
    total: number;
  };
  financingActivities: {
    activities: Array<{
      description: string;
      amount: number;
    }>;
    total: number;
  };
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
}

export interface FinancialRatios {
  profitability: {
    grossProfitMargin: number;
    netProfitMargin: number;
    returnOnAssets: number;
    returnOnEquity: number;
  };
  liquidity: {
    currentRatio: number;
    quickRatio: number;
    cashRatio: number;
  };
  efficiency: {
    inventoryTurnover: number;
    receivablesTurnover: number;
    assetTurnover: number;
  };
  leverage: {
    debtToAssets: number;
    debtToEquity: number;
    equityRatio: number;
  };
}

class FinancialStatementsService {
  // Generate Profit & Loss Statement
  async generateProfitLossStatement(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<ProfitLossStatement> {
    const [chartOfAccounts, transactions] = await Promise.all([
      accountsService.getChartOfAccounts(businessId),
      this.getTransactionsForPeriod(businessId, startDate, endDate)
    ]);

    // Calculate revenue
    const revenueAccounts = chartOfAccounts.revenue.map(account => ({
      account,
      amount: this.calculateAccountTotal(account, transactions, 'credit')
    }));
    const totalRevenue = revenueAccounts.reduce((sum, item) => sum + item.amount, 0);

    // Calculate expenses
    const expenseAccounts = chartOfAccounts.expenses.map(account => ({
      account,
      amount: this.calculateAccountTotal(account, transactions, 'debit')
    }));
    const totalExpenses = expenseAccounts.reduce((sum, item) => sum + item.amount, 0);

    // Calculate COGS (assuming account code 5000)
    const cogsAccount = expenseAccounts.find(item => item.account.code === '5000');
    const costOfGoodsSold = cogsAccount ? cogsAccount.amount : 0;

    // Calculate operating expenses (all expenses except COGS)
    const operatingExpenses = totalExpenses - costOfGoodsSold;

    // Calculate derived metrics
    const grossProfit = totalRevenue - costOfGoodsSold;
    const netIncome = grossProfit - operatingExpenses;
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netProfitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    return {
      period: { start: startDate, end: endDate },
      revenue: {
        total: totalRevenue,
        accounts: revenueAccounts.filter(item => item.amount > 0)
      },
      expenses: {
        total: totalExpenses,
        accounts: expenseAccounts.filter(item => item.amount > 0)
      },
      costOfGoodsSold,
      grossProfit,
      operatingExpenses,
      netIncome,
      grossProfitMargin,
      netProfitMargin
    };
  }

  // Generate Balance Sheet
  async generateBalanceSheet(
    businessId: string,
    asOfDate: string
  ): Promise<BalanceSheet> {
    const [chartOfAccounts, transactions] = await Promise.all([
      accountsService.getChartOfAccounts(businessId),
      this.getTransactionsUpToDate(businessId, asOfDate)
    ]);

    // Calculate asset balances
    const currentAssets = this.getCurrentAssets(chartOfAccounts.assets, transactions);
    const nonCurrentAssets = this.getNonCurrentAssets(chartOfAccounts.assets, transactions);
    const totalCurrentAssets = currentAssets.reduce((sum, item) => sum + item.amount, 0);
    const totalNonCurrentAssets = nonCurrentAssets.reduce((sum, item) => sum + item.amount, 0);
    const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

    // Calculate liability balances
    const currentLiabilities = this.getCurrentLiabilities(chartOfAccounts.liabilities, transactions);
    const nonCurrentLiabilities = this.getNonCurrentLiabilities(chartOfAccounts.liabilities, transactions);
    const totalCurrentLiabilities = currentLiabilities.reduce((sum, item) => sum + item.amount, 0);
    const totalNonCurrentLiabilities = nonCurrentLiabilities.reduce((sum, item) => sum + item.amount, 0);
    const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

    // Calculate equity balances
    const equityAccounts = chartOfAccounts.equity.map(account => ({
      account,
      amount: this.calculateAccountTotal(account, transactions, 'credit')
    }));
    const totalEquity = equityAccounts.reduce((sum, item) => sum + item.amount, 0);

    return {
      asOfDate,
      assets: {
        current: currentAssets,
        nonCurrent: nonCurrentAssets,
        totalCurrent: totalCurrentAssets,
        totalNonCurrent: totalNonCurrentAssets,
        total: totalAssets
      },
      liabilities: {
        current: currentLiabilities,
        nonCurrent: nonCurrentLiabilities,
        totalCurrent: totalCurrentLiabilities,
        totalNonCurrent: totalNonCurrentLiabilities,
        total: totalLiabilities
      },
      equity: {
        accounts: equityAccounts.filter(item => item.amount > 0),
        total: totalEquity
      },
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity
    };
  }

  // Generate Cash Flow Statement
  async generateCashFlowStatement(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<CashFlowStatement> {
    const profitLoss = await this.generateProfitLossStatement(businessId, startDate, endDate);
    const [beginningBalance, endingBalance] = await Promise.all([
      this.getCashBalance(businessId, startDate),
      this.getCashBalance(businessId, endDate)
    ]);

    // Operating Activities
    const operatingActivities = {
      netIncome: profitLoss.netIncome,
      adjustments: [
        // Add back non-cash expenses (depreciation, etc.)
        // This would be calculated from actual depreciation accounts
      ],
      workingCapitalChanges: [
        // Changes in current assets and liabilities
        // This would be calculated from balance sheet changes
      ],
      total: profitLoss.netIncome // Simplified for now
    };

    // Investing Activities (equipment purchases, etc.)
    const investingActivities = {
      activities: [],
      total: 0
    };

    // Financing Activities (loans, owner investments, etc.)
    const financingActivities = {
      activities: [],
      total: 0
    };

    const netCashFlow = operatingActivities.total + investingActivities.total + financingActivities.total;

    return {
      period: { start: startDate, end: endDate },
      operatingActivities,
      investingActivities,
      financingActivities,
      netCashFlow,
      beginningCash: beginningBalance,
      endingCash: endingBalance
    };
  }

  // Calculate Financial Ratios
  async calculateFinancialRatios(
    businessId: string,
    asOfDate: string
  ): Promise<FinancialRatios> {
    const balanceSheet = await this.generateBalanceSheet(businessId, asOfDate);
    const yearStart = new Date(asOfDate);
    yearStart.setMonth(0, 1);
    const profitLoss = await this.generateProfitLossStatement(
      businessId,
      yearStart.toISOString().split('T')[0],
      asOfDate
    );

    // Profitability Ratios
    const grossProfitMargin = profitLoss.grossProfitMargin;
    const netProfitMargin = profitLoss.netProfitMargin;
    const returnOnAssets = balanceSheet.assets.total > 0 ? 
      (profitLoss.netIncome / balanceSheet.assets.total) * 100 : 0;
    const returnOnEquity = balanceSheet.equity.total > 0 ? 
      (profitLoss.netIncome / balanceSheet.equity.total) * 100 : 0;

    // Liquidity Ratios
    const currentRatio = balanceSheet.liabilities.totalCurrent > 0 ? 
      balanceSheet.assets.totalCurrent / balanceSheet.liabilities.totalCurrent : 0;
    const quickRatio = currentRatio; // Simplified - would exclude inventory
    const cashRatio = currentRatio; // Simplified - would use only cash

    // Efficiency Ratios (simplified calculations)
    const inventoryTurnover = 6; // Would calculate from COGS / Average Inventory
    const receivablesTurnover = 12; // Would calculate from Sales / Average AR
    const assetTurnover = balanceSheet.assets.total > 0 ? 
      profitLoss.revenue.total / balanceSheet.assets.total : 0;

    // Leverage Ratios
    const debtToAssets = balanceSheet.assets.total > 0 ? 
      (balanceSheet.liabilities.total / balanceSheet.assets.total) * 100 : 0;
    const debtToEquity = balanceSheet.equity.total > 0 ? 
      (balanceSheet.liabilities.total / balanceSheet.equity.total) * 100 : 0;
    const equityRatio = balanceSheet.assets.total > 0 ? 
      (balanceSheet.equity.total / balanceSheet.assets.total) * 100 : 0;

    return {
      profitability: {
        grossProfitMargin,
        netProfitMargin,
        returnOnAssets,
        returnOnEquity
      },
      liquidity: {
        currentRatio,
        quickRatio,
        cashRatio
      },
      efficiency: {
        inventoryTurnover,
        receivablesTurnover,
        assetTurnover
      },
      leverage: {
        debtToAssets,
        debtToEquity,
        equityRatio
      }
    };
  }

  // Helper methods
  private async getTransactionsForPeriod(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('business_id', businessId)
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('status', 'completed');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  private async getTransactionsUpToDate(
    businessId: string,
    asOfDate: string
  ): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('business_id', businessId)
      .lte('date', asOfDate)
      .eq('status', 'completed');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  private calculateAccountTotal(
    account: AccountWithType,
    transactions: Transaction[],
    normalBalance: 'debit' | 'credit'
  ): number {
    // This is a simplified calculation
    // In a real system, you'd map transactions to specific accounts
    const accountTransactions = transactions.filter(t => 
      t.category.toLowerCase().includes(account.name.toLowerCase()) ||
      account.name.toLowerCase().includes(t.category.toLowerCase())
    );

    return accountTransactions.reduce((sum, t) => {
      if (normalBalance === 'debit') {
        return sum + (t.type === 'expense' ? t.amount : 0);
      } else {
        return sum + (t.type === 'sale' ? t.amount : 0);
      }
    }, 0);
  }

  private getCurrentAssets(
    assets: AccountWithType[],
    transactions: Transaction[]
  ): Array<{ account: AccountWithType; amount: number }> {
    // Current assets are typically cash, receivables, inventory
    const currentAssetCodes = ['1000', '1100', '1200', '1210', '1220'];
    return assets
      .filter(account => currentAssetCodes.includes(account.code))
      .map(account => ({
        account,
        amount: this.calculateAccountTotal(account, transactions, 'debit')
      }))
      .filter(item => item.amount > 0);
  }

  private getNonCurrentAssets(
    assets: AccountWithType[],
    transactions: Transaction[]
  ): Array<{ account: AccountWithType; amount: number }> {
    // Non-current assets are typically equipment, property
    const nonCurrentAssetCodes = ['1300', '1400', '1500'];
    return assets
      .filter(account => nonCurrentAssetCodes.includes(account.code))
      .map(account => ({
        account,
        amount: this.calculateAccountTotal(account, transactions, 'debit')
      }))
      .filter(item => item.amount > 0);
  }

  private getCurrentLiabilities(
    liabilities: AccountWithType[],
    transactions: Transaction[]
  ): Array<{ account: AccountWithType; amount: number }> {
    // Current liabilities are typically accounts payable, short-term debt
    const currentLiabilityCodes = ['2000', '2100'];
    return liabilities
      .filter(account => currentLiabilityCodes.includes(account.code))
      .map(account => ({
        account,
        amount: this.calculateAccountTotal(account, transactions, 'credit')
      }))
      .filter(item => item.amount > 0);
  }

  private getNonCurrentLiabilities(
    liabilities: AccountWithType[],
    transactions: Transaction[]
  ): Array<{ account: AccountWithType; amount: number }> {
    // Non-current liabilities are typically long-term debt
    const nonCurrentLiabilityCodes = ['2200', '2300'];
    return liabilities
      .filter(account => nonCurrentLiabilityCodes.includes(account.code))
      .map(account => ({
        account,
        amount: this.calculateAccountTotal(account, transactions, 'credit')
      }))
      .filter(item => item.amount > 0);
  }

  private async getCashBalance(businessId: string, date: string): Promise<number> {
    // Get cash account balance as of date
    // This would typically query the account_balances table
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('business_id', businessId)
      .lte('date', date)
      .eq('status', 'completed');

    if (error) {
      throw new Error(error.message);
    }

    // Simplified cash calculation
    return (data || []).reduce((balance, t) => {
      return balance + (t.type === 'sale' ? t.amount : -t.amount);
    }, 0);
  }
}

// Export singleton instance
export const financialStatementsService = new FinancialStatementsService();