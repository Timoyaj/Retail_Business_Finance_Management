import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, TrendingUp, DollarSign, BarChart3, PieChart } from 'lucide-react';
import { useBusiness } from '../contexts/BusinessContext';
import { 
  financialStatementsService, 
  type ProfitLossStatement, 
  type BalanceSheet, 
  type CashFlowStatement,
  type FinancialRatios 
} from '../lib/financialStatements';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';

const FinancialStatementsPage: React.FC = () => {
  const { profile } = useBusiness();
  const [activeStatement, setActiveStatement] = useState<'pl' | 'bs' | 'cf' | 'ratios'>('pl');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(false);
  
  const [profitLoss, setProfitLoss] = useState<ProfitLossStatement | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowStatement | null>(null);
  const [ratios, setRatios] = useState<FinancialRatios | null>(null);

  useEffect(() => {
    if (profile) {
      loadFinancialStatements();
    }
  }, [profile, selectedPeriod]);

  const loadFinancialStatements = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = getStartDate(selectedPeriod);

      const [plStatement, bsStatement, cfStatement, financialRatios] = await Promise.all([
        financialStatementsService.generateProfitLossStatement(profile.id, startDate, endDate),
        financialStatementsService.generateBalanceSheet(profile.id, endDate),
        financialStatementsService.generateCashFlowStatement(profile.id, startDate, endDate),
        financialStatementsService.calculateFinancialRatios(profile.id, endDate)
      ]);

      setProfitLoss(plStatement);
      setBalanceSheet(bsStatement);
      setCashFlow(cfStatement);
      setRatios(financialRatios);
    } catch (error) {
      console.error('Error loading financial statements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStartDate = (period: string): string => {
    const now = new Date();
    switch (period) {
      case 'week':
        now.setDate(now.getDate() - 7);
        break;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        now.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        now.setFullYear(now.getFullYear() - 1);
        break;
    }
    return now.toISOString().split('T')[0];
  };

  const formatCurrency = (amount: number): string => {
    return `₦${Math.abs(amount).toLocaleString()}`;
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage.toFixed(1)}%`;
  };

  const renderProfitLossStatement = () => {
    if (!profitLoss) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Profit & Loss Statement</h3>
          <p className="text-gray-600">
            For the period {new Date(profitLoss.period.start).toLocaleDateString()} to{' '}
            {new Date(profitLoss.period.end).toLocaleDateString()}
          </p>
        </div>

        {/* Revenue Section */}
        <Card>
          <h4 className="text-lg font-semibold text-green-600 mb-4">Revenue</h4>
          <div className="space-y-2">
            {profitLoss.revenue.accounts.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-700">{item.account.name}</span>
                <span className="font-medium text-green-600">{formatCurrency(item.amount)}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total Revenue</span>
              <span className="text-green-600">{formatCurrency(profitLoss.revenue.total)}</span>
            </div>
          </div>
        </Card>

        {/* Cost of Goods Sold */}
        <Card>
          <h4 className="text-lg font-semibold text-orange-600 mb-4">Cost of Goods Sold</h4>
          <div className="flex justify-between font-bold">
            <span>Total COGS</span>
            <span className="text-orange-600">{formatCurrency(profitLoss.costOfGoodsSold)}</span>
          </div>
        </Card>

        {/* Gross Profit */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold text-blue-600">Gross Profit</h4>
              <p className="text-sm text-blue-600">
                Margin: {formatPercentage(profitLoss.grossProfitMargin)}
              </p>
            </div>
            <span className="text-xl font-bold text-blue-600">
              {formatCurrency(profitLoss.grossProfit)}
            </span>
          </div>
        </Card>

        {/* Operating Expenses */}
        <Card>
          <h4 className="text-lg font-semibold text-red-600 mb-4">Operating Expenses</h4>
          <div className="space-y-2">
            {profitLoss.expenses.accounts
              .filter(item => item.account.code !== '5000') // Exclude COGS
              .map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-700">{item.account.name}</span>
                  <span className="font-medium text-red-600">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total Operating Expenses</span>
              <span className="text-red-600">{formatCurrency(profitLoss.operatingExpenses)}</span>
            </div>
          </div>
        </Card>

        {/* Net Income */}
        <Card className={`${profitLoss.netIncome >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h4 className={`text-lg font-semibold ${profitLoss.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Net {profitLoss.netIncome >= 0 ? 'Income' : 'Loss'}
              </h4>
              <p className={`text-sm ${profitLoss.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Margin: {formatPercentage(profitLoss.netProfitMargin)}
              </p>
            </div>
            <span className={`text-xl font-bold ${profitLoss.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(profitLoss.netIncome)}
            </span>
          </div>
        </Card>
      </div>
    );
  };

  const renderBalanceSheet = () => {
    if (!balanceSheet) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Balance Sheet</h3>
          <p className="text-gray-600">
            As of {new Date(balanceSheet.asOfDate).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assets */}
          <div className="space-y-4">
            <Card>
              <h4 className="text-lg font-semibold text-green-600 mb-4">Assets</h4>
              
              {/* Current Assets */}
              <div className="mb-4">
                <h5 className="font-medium text-gray-700 mb-2">Current Assets</h5>
                <div className="space-y-1 ml-4">
                  {balanceSheet.assets.current.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.account.name}</span>
                      <span>{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-1 flex justify-between font-medium">
                    <span>Total Current Assets</span>
                    <span>{formatCurrency(balanceSheet.assets.totalCurrent)}</span>
                  </div>
                </div>
              </div>

              {/* Non-Current Assets */}
              {balanceSheet.assets.nonCurrent.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">Non-Current Assets</h5>
                  <div className="space-y-1 ml-4">
                    {balanceSheet.assets.nonCurrent.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.account.name}</span>
                        <span>{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-1 flex justify-between font-medium">
                      <span>Total Non-Current Assets</span>
                      <span>{formatCurrency(balanceSheet.assets.totalNonCurrent)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t-2 pt-2 flex justify-between font-bold text-green-600">
                <span>Total Assets</span>
                <span>{formatCurrency(balanceSheet.assets.total)}</span>
              </div>
            </Card>
          </div>

          {/* Liabilities & Equity */}
          <div className="space-y-4">
            {/* Liabilities */}
            <Card>
              <h4 className="text-lg font-semibold text-red-600 mb-4">Liabilities</h4>
              
              {/* Current Liabilities */}
              {balanceSheet.liabilities.current.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">Current Liabilities</h5>
                  <div className="space-y-1 ml-4">
                    {balanceSheet.liabilities.current.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.account.name}</span>
                        <span>{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-1 flex justify-between font-medium">
                      <span>Total Current Liabilities</span>
                      <span>{formatCurrency(balanceSheet.liabilities.totalCurrent)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t-2 pt-2 flex justify-between font-bold text-red-600">
                <span>Total Liabilities</span>
                <span>{formatCurrency(balanceSheet.liabilities.total)}</span>
              </div>
            </Card>

            {/* Equity */}
            <Card>
              <h4 className="text-lg font-semibold text-purple-600 mb-4">Equity</h4>
              <div className="space-y-1">
                {balanceSheet.equity.accounts.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.account.name}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="border-t-2 pt-2 flex justify-between font-bold text-purple-600">
                  <span>Total Equity</span>
                  <span>{formatCurrency(balanceSheet.equity.total)}</span>
                </div>
              </div>
            </Card>

            {/* Total Check */}
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex justify-between font-bold text-blue-600">
                <span>Total Liabilities & Equity</span>
                <span>{formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderFinancialRatios = () => {
    if (!ratios) return null;

    const ratioSections = [
      {
        title: 'Profitability Ratios',
        color: 'green',
        ratios: [
          { name: 'Gross Profit Margin', value: formatPercentage(ratios.profitability.grossProfitMargin) },
          { name: 'Net Profit Margin', value: formatPercentage(ratios.profitability.netProfitMargin) },
          { name: 'Return on Assets', value: formatPercentage(ratios.profitability.returnOnAssets) },
          { name: 'Return on Equity', value: formatPercentage(ratios.profitability.returnOnEquity) },
        ]
      },
      {
        title: 'Liquidity Ratios',
        color: 'blue',
        ratios: [
          { name: 'Current Ratio', value: ratios.liquidity.currentRatio.toFixed(2) },
          { name: 'Quick Ratio', value: ratios.liquidity.quickRatio.toFixed(2) },
          { name: 'Cash Ratio', value: ratios.liquidity.cashRatio.toFixed(2) },
        ]
      },
      {
        title: 'Efficiency Ratios',
        color: 'purple',
        ratios: [
          { name: 'Inventory Turnover', value: `${ratios.efficiency.inventoryTurnover.toFixed(1)}x` },
          { name: 'Receivables Turnover', value: `${ratios.efficiency.receivablesTurnover.toFixed(1)}x` },
          { name: 'Asset Turnover', value: `${ratios.efficiency.assetTurnover.toFixed(2)}x` },
        ]
      },
      {
        title: 'Leverage Ratios',
        color: 'orange',
        ratios: [
          { name: 'Debt to Assets', value: formatPercentage(ratios.leverage.debtToAssets) },
          { name: 'Debt to Equity', value: formatPercentage(ratios.leverage.debtToEquity) },
          { name: 'Equity Ratio', value: formatPercentage(ratios.leverage.equityRatio) },
        ]
      }
    ];

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Financial Ratios Analysis</h3>
          <p className="text-gray-600">Key performance indicators for your business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ratioSections.map((section, index) => (
            <Card key={index}>
              <h4 className={`text-lg font-semibold text-${section.color}-600 mb-4`}>
                {section.title}
              </h4>
              <div className="space-y-3">
                {section.ratios.map((ratio, ratioIndex) => (
                  <div key={ratioIndex} className="flex justify-between items-center">
                    <span className="text-gray-700">{ratio.name}</span>
                    <span className={`font-bold text-${section.color}-600`}>{ratio.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'pl', name: 'Profit & Loss', icon: TrendingUp },
    { id: 'bs', name: 'Balance Sheet', icon: BarChart3 },
    { id: 'cf', name: 'Cash Flow', icon: DollarSign },
    { id: 'ratios', name: 'Financial Ratios', icon: PieChart },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Generating financial statements...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Statements</h1>
            <p className="text-gray-600">Professional financial reports and analysis</p>
          </motion.div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveStatement(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeStatement === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Statement Content */}
        <motion.div
          key={activeStatement}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeStatement === 'pl' && renderProfitLossStatement()}
          {activeStatement === 'bs' && renderBalanceSheet()}
          {activeStatement === 'cf' && (
            <div className="text-center py-12">
              <p className="text-gray-500">Cash Flow Statement coming soon...</p>
            </div>
          )}
          {activeStatement === 'ratios' && renderFinancialRatios()}
        </motion.div>
      </div>
    </Layout>
  );
};

export default FinancialStatementsPage;