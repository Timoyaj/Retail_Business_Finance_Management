import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Plus, 
  ArrowUpDown,
  Calculator,
  FileText,
  Clock
} from 'lucide-react';
import { useBusiness } from '../contexts/BusinessContext';
import { 
  inventoryValuationService, 
  type ValuationResult, 
  type InventoryMovement,
  type InventoryLayer 
} from '../lib/inventoryValuation';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';

const InventoryValuationPage: React.FC = () => {
  const { profile, products } = useBusiness();
  const [selectedMethod, setSelectedMethod] = useState<'FIFO' | 'WEIGHTED_AVERAGE'>('FIFO');
  const [inventorySummary, setInventorySummary] = useState<Array<{
    product: any;
    valuation: ValuationResult;
  }>>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [productMovements, setProductMovements] = useState<InventoryMovement[]>([]);
  const [productLayers, setProductLayers] = useState<InventoryLayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    productId: '',
    quantity: '',
    reason: '',
    unitCost: ''
  });

  useEffect(() => {
    if (profile) {
      loadInventorySummary();
    }
  }, [profile, selectedMethod]);

  useEffect(() => {
    if (selectedProduct) {
      loadProductDetails(selectedProduct);
    }
  }, [selectedProduct]);

  const loadInventorySummary = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const summary = await inventoryValuationService.getInventorySummary(profile.id, selectedMethod);
      setInventorySummary(summary);
    } catch (error) {
      console.error('Error loading inventory summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProductDetails = async (productId: string) => {
    try {
      const [movements, layers] = await Promise.all([
        inventoryValuationService.getInventoryMovements(productId, 20),
        inventoryValuationService.getInventoryLayers(productId)
      ]);

      setProductMovements(movements);
      setProductLayers(layers);
    } catch (error) {
      console.error('Error loading product details:', error);
    }
  };

  const handleAdjustInventory = async () => {
    if (!adjustmentForm.productId || !adjustmentForm.quantity || !adjustmentForm.reason) return;

    try {
      await inventoryValuationService.adjustInventory(
        adjustmentForm.productId,
        parseInt(adjustmentForm.quantity),
        adjustmentForm.reason,
        adjustmentForm.unitCost ? parseFloat(adjustmentForm.unitCost) : undefined
      );

      setAdjustmentForm({
        productId: '',
        quantity: '',
        reason: '',
        unitCost: ''
      });
      setShowAdjustmentModal(false);
      
      // Reload data
      await loadInventorySummary();
      if (selectedProduct) {
        await loadProductDetails(selectedProduct);
      }
    } catch (error) {
      console.error('Error adjusting inventory:', error);
      alert('Failed to adjust inventory. Please try again.');
    }
  };

  const initializeInventoryTracking = async () => {
    if (!profile) return;

    try {
      await inventoryValuationService.initializeInventoryTracking(profile.id);
      await loadInventorySummary();
      alert('Inventory tracking initialized successfully!');
    } catch (error) {
      console.error('Error initializing inventory tracking:', error);
      alert('Failed to initialize inventory tracking. Please try again.');
    }
  };

  const formatCurrency = (amount: number): string => {
    return `₦${amount.toLocaleString()}`;
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'text-green-600 bg-green-100';
      case 'sale': return 'text-blue-600 bg-blue-100';
      case 'adjustment': return 'text-orange-600 bg-orange-100';
      case 'transfer': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const totalInventoryValue = inventorySummary.reduce((sum, item) => sum + item.valuation.totalValue, 0);
  const totalInventoryQuantity = inventorySummary.reduce((sum, item) => sum + item.valuation.totalQuantity, 0);

  if (isLoading && inventorySummary.length === 0) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading inventory valuation...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Valuation</h1>
            <p className="text-gray-600">Advanced inventory costing and valuation methods</p>
          </motion.div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value as 'FIFO' | 'WEIGHTED_AVERAGE')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="FIFO">FIFO Method</option>
              <option value="WEIGHTED_AVERAGE">Weighted Average</option>
            </select>
            <Button onClick={() => setShowAdjustmentModal(true)}>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Adjust Inventory
            </Button>
            <Button variant="outline" onClick={initializeInventoryTracking}>
              <Plus className="mr-2 h-4 w-4" />
              Initialize Tracking
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
                  <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalInventoryValue)}
                  </p>
                  <Badge variant="primary" size="sm">{selectedMethod}</Badge>
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
                  <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalInventoryQuantity.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Units in stock</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600">Average Cost</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(totalInventoryQuantity > 0 ? totalInventoryValue / totalInventoryQuantity : 0)}
                  </p>
                  <p className="text-xs text-gray-500">Per unit</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-purple-600" />
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
                  <p className="text-sm font-medium text-gray-600">Products Tracked</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {inventorySummary.filter(item => item.valuation.totalQuantity > 0).length}
                  </p>
                  <p className="text-xs text-gray-500">With inventory</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Method Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedMethod === 'FIFO' ? 'First In, First Out (FIFO)' : 'Weighted Average Cost'}
                </h3>
                <p className="text-gray-600">
                  {selectedMethod === 'FIFO' 
                    ? 'FIFO assumes that the oldest inventory items are sold first. This method provides more accurate current market value for remaining inventory and is commonly used for perishable goods.'
                    : 'Weighted Average calculates the average cost of all inventory purchases. This method smooths out price fluctuations and is simpler to calculate, making it ideal for businesses with similar inventory items.'
                  }
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Inventory Summary Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Inventory Valuation Summary</h3>
              <Badge variant="neutral">{inventorySummary.length} Products</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">SKU</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Avg Cost</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Total Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Method</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventorySummary.map((item, index) => (
                    <tr 
                      key={item.product.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        selectedProduct === item.product.id ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => setSelectedProduct(item.product.id)}
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-500">{item.product.category}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-sm text-gray-600">
                        {item.product.sku}
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {item.valuation.totalQuantity.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {formatCurrency(item.valuation.averageCost)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-green-600">
                        {formatCurrency(item.valuation.totalValue)}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="primary" size="sm">
                          {item.valuation.method}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdjustmentForm({ ...adjustmentForm, productId: item.product.id });
                            setShowAdjustmentModal(true);
                          }}
                        >
                          Adjust
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {inventorySummary.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No inventory data available. Initialize inventory tracking to get started.</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Product Details */}
        {selectedProduct && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Inventory Movements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card>
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Movements</h3>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {productMovements.map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMovementTypeColor(movement.movement_type)}`}>
                          {movement.movement_type}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity} units
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(movement.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(movement.unit_cost)}
                        </p>
                        <p className="text-xs text-gray-500">per unit</p>
                      </div>
                    </div>
                  ))}

                  {productMovements.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No movements recorded for this product.</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* FIFO Layers */}
            {selectedMethod === 'FIFO' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card>
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingUp className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">FIFO Layers</h3>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {productLayers.map((layer, index) => (
                      <div key={layer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Layer #{index + 1}
                          </p>
                          <p className="text-xs text-gray-500">
                            Purchased: {new Date(layer.purchase_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {layer.remaining_quantity} / {layer.quantity} units
                          </p>
                          <p className="text-xs text-gray-500">
                            @ {formatCurrency(layer.unit_cost)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {productLayers.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No inventory layers found for this product.</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Inventory Adjustment Modal */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Adjust Inventory</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product
                  </label>
                  <select
                    value={adjustmentForm.productId}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, productId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity Adjustment
                  </label>
                  <input
                    type="number"
                    value={adjustmentForm.quantity}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter positive or negative number"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use positive numbers to add inventory, negative to reduce
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Cost (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={adjustmentForm.unitCost}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, unitCost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Adjustment
                  </label>
                  <textarea
                    value={adjustmentForm.reason}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                    placeholder="Explain the reason for this adjustment"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAdjustmentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdjustInventory}
                  disabled={!adjustmentForm.productId || !adjustmentForm.quantity || !adjustmentForm.reason}
                >
                  Apply Adjustment
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default InventoryValuationPage;