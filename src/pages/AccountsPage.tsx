import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit3, Trash2, FolderOpen, Building } from 'lucide-react';
import { useBusiness } from '../contexts/BusinessContext';
import { accountsService, type ChartOfAccounts, type AccountWithType, type AccountType } from '../lib/accounts';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';

const AccountsPage: React.FC = () => {
  const { profile } = useBusiness();
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccounts | null>(null);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [accountForm, setAccountForm] = useState({
    code: '',
    name: '',
    description: '',
    account_type_id: '',
    parent_account_id: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      loadAccountsData();
    }
  }, [profile]);

  const loadAccountsData = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const [chart, types] = await Promise.all([
        accountsService.getChartOfAccounts(profile.id),
        accountsService.getAccountTypes()
      ]);

      setChartOfAccounts(chart);
      setAccountTypes(types);
    } catch (error) {
      console.error('Error loading accounts data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAccount = async () => {
    if (!profile || !accountForm.code || !accountForm.name || !accountForm.account_type_id) return;

    setIsSubmitting(true);
    try {
      const accountData = {
        business_id: profile.id,
        code: accountForm.code,
        name: accountForm.name,
        description: accountForm.description || null,
        account_type_id: accountForm.account_type_id,
        parent_account_id: accountForm.parent_account_id || null,
      };

      if (editingAccount) {
        await accountsService.updateAccount(editingAccount, accountData);
      } else {
        await accountsService.createAccount(accountData);
      }

      await loadAccountsData();
      resetForm();
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Failed to save account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAccountForm({
      code: '',
      name: '',
      description: '',
      account_type_id: '',
      parent_account_id: '',
    });
    setShowNewAccountModal(false);
    setEditingAccount(null);
  };

  const handleEditAccount = (account: AccountWithType) => {
    setAccountForm({
      code: account.code,
      name: account.name,
      description: account.description || '',
      account_type_id: account.account_type_id,
      parent_account_id: account.parent_account_id || '',
    });
    setEditingAccount(account.id);
    setShowNewAccountModal(true);
  };

  const handleDeactivateAccount = async (accountId: string) => {
    if (confirm('Are you sure you want to deactivate this account?')) {
      try {
        await accountsService.deactivateAccount(accountId);
        await loadAccountsData();
      } catch (error) {
        console.error('Error deactivating account:', error);
        alert('Failed to deactivate account. Please try again.');
      }
    }
  };

  const getAccountTypeColor = (typeName: string) => {
    switch (typeName.toLowerCase()) {
      case 'asset': return 'text-green-600 bg-green-100';
      case 'liability': return 'text-red-600 bg-red-100';
      case 'equity': return 'text-purple-600 bg-purple-100';
      case 'revenue': return 'text-blue-600 bg-blue-100';
      case 'expense': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderAccountSection = (title: string, accounts: AccountWithType[], icon: React.ReactNode) => (
    <Card className="mb-6">
      <div className="flex items-center space-x-3 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <Badge variant="neutral" size="sm">{accounts.length}</Badge>
      </div>

      {accounts.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Code</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Account Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-mono text-sm text-gray-900">
                    {account.code}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{account.name}</span>
                      {account.is_system && (
                        <Badge variant="primary" size="sm">System</Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {account.description || '-'}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.account_type.name)}`}>
                      {account.account_type.name}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditAccount(account)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      {!account.is_system && (
                        <button 
                          onClick={() => handleDeactivateAccount(account.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No {title.toLowerCase()} accounts found.</p>
        </div>
      )}
    </Card>
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading chart of accounts...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chart of Accounts</h1>
            <p className="text-gray-600">Manage your business accounting structure</p>
          </motion.div>

          <Button onClick={() => setShowNewAccountModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Account
          </Button>
        </div>

        {/* Chart of Accounts Overview */}
        {chartOfAccounts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{chartOfAccounts.assets.length}</p>
                  <p className="text-sm text-green-700">Assets</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{chartOfAccounts.liabilities.length}</p>
                  <p className="text-sm text-red-700">Liabilities</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{chartOfAccounts.equity.length}</p>
                  <p className="text-sm text-purple-700">Equity</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{chartOfAccounts.revenue.length}</p>
                  <p className="text-sm text-blue-700">Revenue</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{chartOfAccounts.expenses.length}</p>
                  <p className="text-sm text-orange-700">Expenses</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Account Sections */}
        {chartOfAccounts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {renderAccountSection(
              'Assets',
              chartOfAccounts.assets,
              <Building className="h-5 w-5 text-green-600" />
            )}

            {renderAccountSection(
              'Liabilities',
              chartOfAccounts.liabilities,
              <FolderOpen className="h-5 w-5 text-red-600" />
            )}

            {renderAccountSection(
              'Equity',
              chartOfAccounts.equity,
              <FolderOpen className="h-5 w-5 text-purple-600" />
            )}

            {renderAccountSection(
              'Revenue',
              chartOfAccounts.revenue,
              <FolderOpen className="h-5 w-5 text-blue-600" />
            )}

            {renderAccountSection(
              'Expenses',
              chartOfAccounts.expenses,
              <FolderOpen className="h-5 w-5 text-orange-600" />
            )}
          </motion.div>
        )}
      </div>

      {/* New/Edit Account Modal */}
      {showNewAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {editingAccount ? 'Edit Account' : 'Add New Account'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Code
                  </label>
                  <input
                    type="text"
                    value={accountForm.code}
                    onChange={(e) => setAccountForm({ ...accountForm, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., 1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Cash"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <select
                    value={accountForm.account_type_id}
                    onChange={(e) => setAccountForm({ ...accountForm, account_type_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select account type</option>
                    {accountTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.normal_balance})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={accountForm.description}
                    onChange={(e) => setAccountForm({ ...accountForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                    placeholder="Account description"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAccount}
                  disabled={!accountForm.code || !accountForm.name || !accountForm.account_type_id || isSubmitting}
                  isLoading={isSubmitting}
                >
                  {editingAccount ? 'Update Account' : 'Create Account'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default AccountsPage;