import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  AlertTriangle,
  ShoppingCart,
  Calendar,
  Users,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBusiness } from '../contexts/BusinessContext';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { profile, transactions, products, getFinancialSummary, isLoading } = useBusiness();

  const financialSummary = getFinancialSummary();
  const lowStockProducts = products.filter(p => p.current_stock <= p.low_stock_threshold);

  // Sample data for charts (in a real app, this would be calculated from actual data)
  const salesData = [
    { name: 'Mon', sales: 12000, expenses: 4000 },
    { name: 'Tue', sales: 18000, expenses: 6000 },
    { name: 'Wed', sales: 8000, expenses: 3000 },
    { name: 'Thu', sales: 25000, expenses: 8000 },
    { name: 'Fri', sales: 32000, expenses: 10000 },
    { name: 'Sat', sales: 45000, expenses: 12000 },
    { name: 'Sun', sales: 28000, expenses: 7000 },
  ];

  const productPerformance = [
    { name: 'T-Shirts', sold: 45, revenue: 225000 },
    { name: 'Jeans', sold: 23, revenue: 345000 },
    { name: 'Accessories', sold: 67, revenue: 134000 },
    { name: 'Footwear', sold: 12, revenue: 180000 },
  ];

  const widgets = [
    {
      title: 'Total Revenue',
      value: `₦${financialSummary.totalRevenue.toLocaleString()}`,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Net Profit',
      value: `₦${financialSummary.netProfit.toLocaleString()}`,
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Inventory Value',
      value: `₦${financialSummary.inventoryValue.toLocaleString()}`,
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: Package,
      color: 'from-purple-500 to-violet-500',
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts.length.toString(),
      change: lowStockProducts.length > 0 ? 'Needs attention' : 'All good',
      changeType: lowStockProducts.length > 0 ? 'warning' as const : 'positive' as const,
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const recentActivities = transactions.slice(0, 5).map(transaction => ({
    id: transaction.id,
    type: transaction.type,
    description: transaction.description,
    time: new Date(transaction.created_at).toLocaleTimeString(),
    amount: transaction.type === 'expense' ? -transaction.amount : transaction.amount,
  }));

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your business data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-600">
              Here's what's happening with {profile?.name || 'your business'} today.
            </p>
          </motion.div>
        </div>

        {/* KPI Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {widgets.map((widget, index) => {
            const Icon = widget.icon;
            return (
              <motion.div
                key={widget.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card hover className="relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${widget.color} opacity-10 rounded-full transform translate-x-6 -translate-y-6`} />
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {widget.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        {widget.value}
                      </p>
                      <Badge 
                        variant={widget.changeType === 'positive' ? 'success' : widget.changeType === 'negative' ? 'error' : 'warning'}
                        size="sm"
                      >
                        {widget.change}
                      </Badge>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-br ${widget.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales vs Expenses Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Profit Pulse - Weekly Overview
                </h3>
                <Badge variant="primary">This Week</Badge>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₦${value?.toLocaleString()}`, '']} />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stackId="2"
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.6} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Product Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Product Performance Palette
                </h3>
                <Badge variant="secondary">Top Performers</Badge>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₦${value?.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="lg:col-span-2"
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Story Threads - Recent Activities
                </h3>
                <Badge variant="neutral">Live Updates</Badge>
              </div>

              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'sale' ? 'bg-green-100' :
                        activity.type === 'expense' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {activity.type === 'sale' ? (
                          <ShoppingCart className="h-5 w-5 text-green-600" />
                        ) : activity.type === 'expense' ? (
                          <DollarSign className="h-5 w-5 text-red-600" />
                        ) : (
                          <Package className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.time}
                        </p>
                      </div>
                      
                      {activity.amount !== 0 && (
                        <div className={`text-sm font-semibold ${
                          activity.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {activity.amount > 0 ? '+' : ''}₦{Math.abs(activity.amount).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No recent activities. Start by adding a sale or expense!</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions & Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="space-y-6"
          >
            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
              <Card>
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h3 className="font-semibold text-gray-900">Shrinkage Spotlight</h3>
                </div>
                
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          {product.current_stock} units left
                        </p>
                      </div>
                      <Badge variant="warning" size="sm">
                        Low Stock
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Total Products</span>
                  </div>
                  <span className="font-semibold text-blue-600">{products.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Total Transactions</span>
                  </div>
                  <span className="font-semibold text-green-600">{transactions.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Business Type</span>
                  </div>
                  <span className="font-semibold text-purple-600 capitalize">
                    {profile?.type || 'Not set'}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;