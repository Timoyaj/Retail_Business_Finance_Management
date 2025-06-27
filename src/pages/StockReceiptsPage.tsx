import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Truck, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Calendar
} from 'lucide-react';
import { useBusiness } from '../contexts/BusinessContext';
import { 
  purchaseOrdersService, 
  type StockReceiptWithDetails, 
  type PurchaseOrderWithDetails 
} from '../lib/purchaseOrders';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';

const StockReceiptsPage: React.FC = () => {
  const { profile, products } = useBusiness();
  const [stockReceipts, setStockReceipts] = useState<StockReceiptWithDetails[]>([]);
  const [pendingPOs, setPendingPOs] = useState<PurchaseOrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<string>('');
  
  const [receiptForm, setReceiptForm] = useState({
    purchase_order_id: '',
    received_by: '',
    notes: '',
    items: [] as Array<{
      purchase_order_item_id: string;
      product_id: string;
      quantity_ordered: number;
      quantity_received: number;
      unit_cost: number;
    }>,
  });

  useEffect(() => {
    if (profile) {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const [receipts, pending] = await Promise.all([
        purchaseOrdersService.getStockReceiptsByBusinessId(profile.id),
        purchaseOrdersService.getPendingPurchaseOrders(profile.id),
      ]);

      setStockReceipts(receipts);
      setPendingPOs(pending);
    } catch (error) {
      console.error('Error loading stock receipts data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePOSelection = (poId: string) => {
    const po = pendingPOs.find(p => p.id === poId);
    if (!po) return;

    setSelectedPO(poId);
    setReceiptForm({
      purchase_order_id: poId,
      received_by: '',
      notes: '',
      items: po.items.map(item => ({
        purchase_order_item_id: item.id,
        product_id: item.product_id,
        quantity_ordered: item.quantity,
        quantity_received: item.quantity - item.quantity_received,
        unit_cost: item.unit_cost,
      })),
    });
  };

  const handleCreateReceipt = async () => {
    if (!profile || !receiptForm.purchase_order_id || receiptForm.items.length === 0) return;

    try {
      const validItems = receiptForm.items.filter(item => item.quantity_received > 0);

      if (validItems.length === 0) {
        alert('Please specify quantities received for at least one item.');
        return;
      }

      await purchaseOrdersService.createStockReceipt(
        profile.id,
        {
          purchase_order_id: receiptForm.purchase_order_id,
          received_by: receiptForm.received_by || undefined,
          notes: receiptForm.notes || undefined,
        },
        validItems
      );

      setReceiptForm({
        purchase_order_id: '',
        received_by: '',
        notes: '',
        items: [],
      });
      setSelectedPO('');
      setShowReceiptModal(false);
      await loadData();
    } catch (error) {
      console.error('Error creating stock receipt:', error);
      alert('Failed to create stock receipt. Please try again.');
    }
  };

  const updateReceiptItem = (index: number, field: string, value: any) => {
    const updatedItems = [...receiptForm.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setReceiptForm({ ...receiptForm, items: updatedItems });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number): string => {
    return `₦${amount.toLocaleString()}`;
  };

  const totalReceiptsValue = stockReceipts.reduce((sum, receipt) => 
    sum + receipt.items.reduce((itemSum, item) => itemSum + item.total_cost, 0), 0
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading stock receipts...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Receipts</h1>
            <p className="text-gray-600">Receive and track incoming inventory</p>
          </motion.div>

          <Button onClick={() => setShowReceiptModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Receive Stock
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Received Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalReceiptsValue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Package className="h-6 w-6 text-green-600" />
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
                  <p className="text-sm font-medium text-gray-600">Total Receipts</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stockReceipts.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600">Pending Deliveries</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {pendingPOs.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Truck className="h-6 w-6 text-orange-600" />
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
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stockReceipts.filter(r => 
                      new Date(r.receipt_date).getMonth() === new Date().getMonth()
                    ).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Pending Deliveries */}
        {pendingPOs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <Truck className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">Pending Deliveries</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingPOs.map((po) => (
                  <div key={po.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{po.po_number}</h4>
                      <Badge variant="primary" size="sm">
                        {po.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Supplier: {po.supplier.name}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Expected: {po.expected_delivery_date 
                        ? new Date(po.expected_delivery_date).toLocaleDateString()
                        : 'TBD'
                      }
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        handlePOSelection(po.id);
                        setShowReceiptModal(true);
                      }}
                    >
                      Receive Items
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Stock Receipts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Stock Receipts</h3>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search receipts..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Receipt Number</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">PO Number</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Supplier</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Receipt Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Received By</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Total Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stockReceipts.map((receipt) => {
                    const totalValue = receipt.items.reduce((sum, item) => sum + item.total_cost, 0);
                    
                    return (
                      <tr key={receipt.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-mono text-sm text-gray-900">
                          {receipt.receipt_number}
                        </td>
                        <td className="py-4 px-4 font-mono text-sm text-gray-600">
                          {receipt.purchase_order?.po_number || '-'}
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {receipt.purchase_order?.supplier.name || 'Direct Receipt'}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {new Date(receipt.receipt_date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {receipt.received_by || '-'}
                        </td>
                        <td className="py-4 px-4 font-semibold text-green-600">
                          {formatCurrency(totalValue)}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(receipt.status)}`}>
                            {receipt.status === 'completed' && <CheckCircle className="inline h-3 w-3 mr-1" />}
                            {receipt.status === 'pending' && <AlertTriangle className="inline h-3 w-3 mr-1" />}
                            {receipt.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {stockReceipts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No stock receipts found. Start receiving inventory!</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Stock Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Receive Stock</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Order
                  </label>
                  <select
                    value={receiptForm.purchase_order_id}
                    onChange={(e) => handlePOSelection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a purchase order</option>
                    {pendingPOs.map((po) => (
                      <option key={po.id} value={po.id}>
                        {po.po_number} - {po.supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Received By
                  </label>
                  <input
                    type="text"
                    value={receiptForm.received_by}
                    onChange={(e) => setReceiptForm({ ...receiptForm, received_by: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Name of person receiving"
                  />
                </div>
              </div>

              {receiptForm.items.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Items to Receive</h4>

                  <div className="space-y-4">
                    {receiptForm.items.map((item, index) => {
                      const product = products.find(p => p.id === item.product_id);
                      const variance = item.quantity_received - item.quantity_ordered;
                      
                      return (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Product
                            </label>
                            <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg">
                              <p className="font-medium text-gray-900">{product?.name}</p>
                              <p className="text-sm text-gray-500">{product?.sku}</p>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Ordered
                            </label>
                            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                              {item.quantity_ordered}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Received
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={item.quantity_received}
                              onChange={(e) => updateReceiptItem(index, 'quantity_received', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Unit Cost
                            </label>
                            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                              {formatCurrency(item.unit_cost)}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Variance
                            </label>
                            <div className={`px-3 py-2 border border-gray-300 rounded-lg ${
                              variance === 0 ? 'bg-green-50 text-green-700' :
                              variance > 0 ? 'bg-blue-50 text-blue-700' :
                              'bg-red-50 text-red-700'
                            }`}>
                              {variance > 0 ? '+' : ''}{variance}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={receiptForm.notes}
                  onChange={(e) => setReceiptForm({ ...receiptForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Additional notes about this receipt"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReceiptModal(false);
                    setSelectedPO('');
                    setReceiptForm({
                      purchase_order_id: '',
                      received_by: '',
                      notes: '',
                      items: [],
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateReceipt}
                  disabled={!receiptForm.purchase_order_id || receiptForm.items.length === 0}
                >
                  Complete Receipt
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default StockReceiptsPage;