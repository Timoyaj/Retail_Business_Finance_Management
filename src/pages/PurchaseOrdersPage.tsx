import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Truck, 
  Package, 
  AlertCircle,
  CheckCircle,
  Clock,
  Edit3,
  Eye
} from 'lucide-react';
import { useBusiness } from '../contexts/BusinessContext';
import { 
  purchaseOrdersService, 
  type PurchaseOrderWithDetails, 
  type Supplier 
} from '../lib/purchaseOrders';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';

const PurchaseOrdersPage: React.FC = () => {
  const { profile, products } = useBusiness();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderWithDetails[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewPOModal, setShowNewPOModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<string | null>(null);
  
  const [poForm, setPOForm] = useState({
    supplier_id: '',
    expected_delivery_date: '',
    notes: '',
    items: [{ product_id: '', quantity: 1, unit_cost: 0 }],
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    payment_terms: 'Net 30',
    notes: '',
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
      const [pos, suppliersData, lowStock] = await Promise.all([
        purchaseOrdersService.getPurchaseOrdersByBusinessId(profile.id),
        purchaseOrdersService.getSuppliersByBusinessId(profile.id),
        purchaseOrdersService.getLowStockProducts(profile.id),
      ]);

      setPurchaseOrders(pos);
      setSuppliers(suppliersData);
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Error loading purchase orders data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePO = async () => {
    if (!profile || !poForm.supplier_id || poForm.items.length === 0) return;

    try {
      const validItems = poForm.items.filter(item => 
        item.product_id && item.quantity > 0 && item.unit_cost > 0
      );

      if (validItems.length === 0) {
        alert('Please add at least one valid item to the purchase order.');
        return;
      }

      await purchaseOrdersService.createPurchaseOrder(
        profile.id,
        {
          supplier_id: poForm.supplier_id,
          expected_delivery_date: poForm.expected_delivery_date || undefined,
          notes: poForm.notes || undefined,
        },
        validItems
      );

      setPOForm({
        supplier_id: '',
        expected_delivery_date: '',
        notes: '',
        items: [{ product_id: '', quantity: 1, unit_cost: 0 }],
      });
      setShowNewPOModal(false);
      await loadData();
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Failed to create purchase order. Please try again.');
    }
  };

  const handleCreateSupplier = async () => {
    if (!profile || !supplierForm.name) return;

    try {
      await purchaseOrdersService.createSupplier({
        business_id: profile.id,
        ...supplierForm,
      });

      setSupplierForm({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        payment_terms: 'Net 30',
        notes: '',
      });
      setShowSupplierModal(false);
      await loadData();
    } catch (error) {
      console.error('Error creating supplier:', error);
      alert('Failed to create supplier. Please try again.');
    }
  };

  const addPOItem = () => {
    setPOForm({
      ...poForm,
      items: [...poForm.items, { product_id: '', quantity: 1, unit_cost: 0 }],
    });
  };

  const removePOItem = (index: number) => {
    setPOForm({
      ...poForm,
      items: poForm.items.filter((_, i) => i !== index),
    });
  };

  const updatePOItem = (index: number, field: string, value: any) => {
    const updatedItems = [...poForm.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setPOForm({ ...poForm, items: updatedItems });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'confirmed': return 'text-yellow-600 bg-yellow-100';
      case 'partially_received': return 'text-orange-600 bg-orange-100';
      case 'received': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit3 className="h-4 w-4" />;
      case 'sent': return <FileText className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'partially_received': return <Package className="h-4 w-4" />;
      case 'received': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number): string => {
    return `₦${amount.toLocaleString()}`;
  };

  const totalPOValue = purchaseOrders.reduce((sum, po) => sum + po.total_amount, 0);
  const pendingPOs = purchaseOrders.filter(po => ['confirmed', 'partially_received'].includes(po.status));

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading purchase orders...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Orders</h1>
            <p className="text-gray-600">Manage suppliers and track purchase orders</p>
          </motion.div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setShowSupplierModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
            <Button onClick={() => setShowNewPOModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Purchase Order
            </Button>
          </div>
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
                  <p className="text-sm font-medium text-gray-600">Total PO Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalPOValue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
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
                  <p className="text-sm font-medium text-gray-600">Active POs</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {pendingPOs.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Truck className="h-6 w-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600">Suppliers</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {suppliers.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-600" />
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
                  <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {lowStockProducts.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-gray-900">Reorder Recommendations</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockProducts.slice(0, 6).map((item) => (
                  <div key={item.product.id} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <Badge variant="warning" size="sm">
                        {item.product.current_stock} left
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">SKU: {item.product.sku}</p>
                    <p className="text-sm text-amber-700">
                      Suggested order: {item.suggested_order_quantity} units
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Purchase Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Purchase Orders</h3>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search purchase orders..."
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
                    <th className="text-left py-3 px-4 font-medium text-gray-600">PO Number</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Supplier</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Order Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Expected Delivery</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Total Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-mono text-sm text-gray-900">
                        {po.po_number}
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{po.supplier.name}</p>
                          <p className="text-sm text-gray-500">{po.supplier.contact_person}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(po.order_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {po.expected_delivery_date 
                          ? new Date(po.expected_delivery_date).toLocaleDateString()
                          : '-'
                        }
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-900">
                        {formatCurrency(po.total_amount)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                            {getStatusIcon(po.status)}
                          </span>
                          <span className="text-sm capitalize">
                            {po.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedPO(po.id)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {purchaseOrders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No purchase orders found. Create your first purchase order!</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* New Purchase Order Modal */}
      {showNewPOModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Create Purchase Order</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier
                  </label>
                  <select
                    value={poForm.supplier_id}
                    onChange={(e) => setPOForm({ ...poForm, supplier_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={poForm.expected_delivery_date}
                    onChange={(e) => setPOForm({ ...poForm, expected_delivery_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Items</h4>
                  <Button variant="outline" size="sm" onClick={addPOItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {poForm.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product
                        </label>
                        <select
                          value={item.product_id}
                          onChange={(e) => updatePOItem(index, 'product_id', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.sku})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updatePOItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Cost (₦)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_cost}
                          onChange={(e) => updatePOItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div className="flex items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total
                          </label>
                          <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                            {formatCurrency(item.quantity * item.unit_cost)}
                          </div>
                        </div>
                        {poForm.items.length > 1 && (
                          <button
                            onClick={() => removePOItem(index)}
                            className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={poForm.notes}
                  onChange={(e) => setPOForm({ ...poForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Additional notes for this purchase order"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowNewPOModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePO}
                  disabled={!poForm.supplier_id || poForm.items.length === 0}
                >
                  Create Purchase Order
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* New Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Add New Supplier</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter supplier name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={supplierForm.contact_person}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Contact person name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="supplier@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="+234-xxx-xxx-xxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Terms
                  </label>
                  <select
                    value={supplierForm.payment_terms}
                    onChange={(e) => setSupplierForm({ ...supplierForm, payment_terms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="COD">Cash on Delivery</option>
                    <option value="Net 15">Net 15 days</option>
                    <option value="Net 30">Net 30 days</option>
                    <option value="Net 60">Net 60 days</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowSupplierModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSupplier}
                  disabled={!supplierForm.name}
                >
                  Add Supplier
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default PurchaseOrdersPage;