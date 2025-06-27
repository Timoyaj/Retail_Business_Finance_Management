import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Package } from 'lucide-react';
import { useBusiness } from '../contexts/BusinessContext';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const ReportsPage: React.FC = () => {
  const { transactions, products, getFinancialSummary } = useBusiness();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  const financialSummary = getFinancialSummary();

  // Sample data for charts (in a real app, this would be calculated from actual data)
  const profitLossData = [
    { month: 'Jan', revenue: 450000, expenses: 280000, profit: 170000 },
    { month: 'Feb', revenue: 380000, expenses: 250000, profit: 130000 },
    { month: 'Mar', revenue: 520000, expenses: 320000, profit: 200000 },
    { month: 'Apr', revenue: 480000, expenses: 300000, profit: 180000 },
    { month: 'May', revenue: 600000, expenses: 350000, profit: 250000 },
    { month: 'Jun', revenue: 550000, expenses: 330000, profit: 220000 },
  ];

  const expenseBreakdown = [
    { name: 'Inventory', value: 150000, color: '#3b82f6' },
    { name: 'Rent', value: 50000, color: '#10b981' },
    { name: 'Utilities', value: 25000, color: '#f97316' },
    { name: 'Marketing', value: 30000, color: '#8b5cf6' },
    { name: 'Other', value: 20000, color: '#ef4444' },
  ];

  const productPerformance = [
    { name: 'T-Shirts', revenue: 125000, profit: 50000 },
    { name: 'Jeans', revenue: 200000, profit: 90000 },
    { name: 'Accessories', value: 75000, profit: 35000 },
    { name: 'Footwear', revenue: 150000, profit: 60000 },
  ];

  const kpis = [
    {
      name: 'Gross Profit Margin',
      value: '45.2%',
      change: '+2.1%',
      changeType: 'positive' as const,
      description: 'Revenue minus cost of goods sold'
    },
    {
      name: 'Inventory Turnover',
      value: '6.8x',
      change: '+0.5x',
      changeType: 'positive' as const,
      description: 'How often inventory is sold per period'
    },
    {
      name: 'Average Transaction',
      value: '₦12,450',
      change: '+5.2%',
      changeType: 'positive' as const,
      description: 'Average value per sales transaction'
    },
    {
      name: 'Customer Retention',
      value: '68%',
      change: '-3.1%',
      changeType: 'negative' as const,
      description: 'Percentage of repeat customers'
    },
  ];

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Reports</h1>
            <p className="text-gray-600">Comprehensive insights into your business performance</p>
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
              Export
            </Button>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₦{financialSummary.totalRevenue.toLocaleString()}
                  </p>
                  <Badge variant="success" size="sm">+12.5%</Badge>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    ₦{financialSummary.totalExpenses.toLocaleString()}
                  </p>
                  <Badge variant="error" size="sm">+8.2%</Badge>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₦{financialSummary.netProfit.toLocaleString()}
                  </p>
                  <Badge variant="primary" size="sm">+15.3%</Badge>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ₦{financialSummary.inventoryValue.toLocaleString()}
                  </p>
                  <Badge variant="neutral" size="sm">-2.1%</Badge>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Profit Pulse Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Profit Pulse - 6 Month Trend</h3>
                <Badge variant="primary">Monthly View</Badge>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={profitLossData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₦${value?.toLocaleString()}`, '']} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stackId="2"
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.8} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Expense Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
                <Badge variant="secondary">Current Month</Badge>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₦${value?.toLocaleString()}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* KPIs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Performance Indicators</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map((kpi, index) => (
                <div key={kpi.name} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{kpi.name}</h4>
                    <Badge 
                      variant={kpi.changeType === 'positive' ? 'success' : 'error'}
                      size="sm"
                    >
                      {kpi.change}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                  <p className="text-xs text-gray-500">{kpi.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Product Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Product Performance Palette</h3>
              <Badge variant="neutral">Top Performers</Badge>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₦${value?.toLocaleString()}`, '']} />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                <Bar dataKey="profit" fill="#10b981" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8"
        >
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Report Actions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Generate P&L Statement
              </Button>
              <Button variant="outline" className="justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Cash Flow Report
              </Button>
              <Button variant="outline" className="justify-start">
                <Package className="mr-2 h-4 w-4" />
                Inventory Valuation
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ReportsPage;