import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, AlertTriangle, Package, Edit3, Trash2, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBusiness } from '../contexts/BusinessContext';
import Layout from '../components/Layout/Layout';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';

const InventoryPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, isLoading } = useBusiness();
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: 'clothing',
    cost_price: '',
    selling_price: '',
    current_stock: '',
    low_stock_threshold: '10',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['clothing', 'electronics', 'accessories', 'shoes', 'bags', 'other'];

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.sku || !productForm.cost_price || !productForm.selling_price) return;

    setIsSubmitting(true);
    try {
      const productData = {
        name: productForm.name,
        sku: productForm.sku,
        category: productForm.category,
        cost_price: parseFloat(productForm.cost_price),
        selling_price: parseFloat(productForm.selling_price),
        current_stock: parseInt(productForm.current_stock) || 0,
        low_stock_threshold: parseInt(productForm.low_stock_threshold) || 10,
        description: productForm.description,
      };

      if (editingProduct) {
        await updateProduct(editingProduct, productData);
      } else {
        await addProduct(productData);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      sku: '',
      category: 'clothing',
      cost_price: '',
      selling_price: '',
      current_stock: '',
      low_stock_threshold: '10',
      description: '',
    });
    setShowNewProductModal(false);
    setEditingProduct(null);
  };

  const handleEditProduct = (product: any) => {
    setProductForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      cost_price: product.cost_price.toString(),
      selling_price: product.selling_price.toString(),
      current_stock: product.current_stock.toString(),
      low_stock_threshold: product.low_stock_threshold.toString(),
      description: product.description || '',
    });
    setEditingProduct(product.id);
    setShowNewProductModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const lowStockProducts = products.filter(p => p.current_stock <= p.low_stock_threshold);
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.current_stock * p.cost_price), 0);
  const totalProducts = products.length;

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading inventory data...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
            <p className="text-gray-600">Manage your products and stock levels</p>
          </motion.div>

          <div className="flex items-center space-x-3">
            <Link to="/inventory-valuation">
              <Button variant="outline">
                <Calculator className="mr-2 h-4 w-4" />
                Valuation
              </Button>
            </Link>
            <Button onClick={() => setShowNewProductModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalProducts}
                  </p>
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
            transition={{ delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₦{totalInventoryValue.toLocaleString()}
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
            transition={{ delay: 0.3 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-red-600">
                    {lowStockProducts.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Advanced Inventory Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Inventory Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/inventory-valuation">
                <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calculator className="h-6 w-6 text-primary-600" />
                    <h4 className="font-semibold text-gray-900">Inventory Valuation</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    FIFO and Weighted Average costing methods for accurate inventory valuation
                  </p>
                  <div className="mt-2">
                    <Badge variant="primary" size="sm">Advanced</Badge>
                  </div>
                </div>
              </Link>
              
              <div className="p-4 border border-gray-200 rounded-lg opacity-50">
                <div className="flex items-center space-x-3 mb-2">
                  <Package className="h-6 w-6 text-gray-400" />
                  <h4 className="font-semibold text-gray-500">Batch Tracking</h4>
                </div>
                <p className="text-sm text-gray-500">
                  Track inventory by batches with expiration dates (Coming Soon)
                </p>
                <div className="mt-2">
                  <Badge variant="neutral" size="sm">Coming Soon</Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

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
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-gray-900">Low Stock Alert</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <Badge variant="warning" size="sm">
                        {product.current_stock} left
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">SKU: {product.sku}</p>
                    <p className="text-xs text-amber-700">
                      Reorder threshold: {product.low_stock_threshold} units
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Products List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Product Catalog</h3>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">SKU</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Cost Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Selling Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-gray-500">{product.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {product.sku}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="neutral" size="sm">
                          {product.category}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        ₦{product.cost_price.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-semibold text-green-600">
                        ₦{product.selling_price.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${
                            product.current_stock <= product.low_stock_threshold 
                              ? 'text-red-600' 
                              : 'text-gray-900'
                          }`}>
                            {product.current_stock}
                          </span>
                          {product.current_stock <= product.low_stock_threshold && (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {products.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No products in inventory yet. Add your first product!</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* New/Edit Product Modal */}
      {showNewProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter SKU"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Price (₦)
                  </label>
                  <input
                    type="number"
                    value={productForm.cost_price}
                    onChange={(e) => setProductForm({ ...productForm, cost_price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price (₦)
                  </label>
                  <input
                    type="number"
                    value={productForm.selling_price}
                    onChange={(e) => setProductForm({ ...productForm, selling_price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    value={productForm.current_stock}
                    onChange={(e) => setProductForm({ ...productForm, current_stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    value={productForm.low_stock_threshold}
                    onChange={(e) => setProductForm({ ...productForm, low_stock_threshold: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                    placeholder="Product description"
                  />
                </div>
              </div>

              {productForm.cost_price && productForm.selling_price && (
                <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                  <p className="text-sm font-medium text-primary-900">
                    Profit Margin: ₦{(parseFloat(productForm.selling_price) - parseFloat(productForm.cost_price)).toLocaleString()} 
                    ({(((parseFloat(productForm.selling_price) - parseFloat(productForm.cost_price)) / parseFloat(productForm.selling_price)) * 100).toFixed(1)}%)
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProduct}
                  disabled={!productForm.name || !productForm.sku || !productForm.cost_price || !productForm.selling_price || isSubmitting}
                  isLoading={isSubmitting}
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default InventoryPage;