import { supabase } from './supabase';
import { inventoryValuationService } from './inventoryValuation';
import type { Database } from './supabase';

// Type aliases for Purchase Orders
export type Supplier = Database['public']['Tables']['suppliers']['Row'];
export type PurchaseOrder = Database['public']['Tables']['purchase_orders']['Row'];
export type PurchaseOrderItem = Database['public']['Tables']['purchase_order_items']['Row'];
export type StockReceipt = Database['public']['Tables']['stock_receipts']['Row'];
export type StockReceiptItem = Database['public']['Tables']['stock_receipt_items']['Row'];

export interface PurchaseOrderWithDetails extends PurchaseOrder {
  supplier: Supplier;
  items: Array<PurchaseOrderItem & {
    product: {
      id: string;
      name: string;
      sku: string;
    };
  }>;
}

export interface StockReceiptWithDetails extends StockReceipt {
  purchase_order?: PurchaseOrder & { supplier: Supplier };
  items: Array<StockReceiptItem & {
    product: {
      id: string;
      name: string;
      sku: string;
    };
  }>;
}

// Purchase Orders service class
class PurchaseOrdersService {
  // Supplier operations
  async createSupplier(supplierData: Database['public']['Tables']['suppliers']['Insert']): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplierData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getSuppliersByBusinessId(businessId: string): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async updateSupplier(supplierId: string, updates: Database['public']['Tables']['suppliers']['Update']): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', supplierId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Purchase Order operations
  async createPurchaseOrder(
    businessId: string,
    supplierData: {
      supplier_id: string;
      expected_delivery_date?: string;
      notes?: string;
    },
    items: Array<{
      product_id: string;
      quantity: number;
      unit_cost: number;
    }>
  ): Promise<PurchaseOrderWithDetails> {
    // Generate PO number
    const { data: poNumberData, error: poNumberError } = await supabase
      .rpc('generate_po_number', { business_id_param: businessId });

    if (poNumberError) {
      throw new Error(poNumberError.message);
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
    const taxAmount = 0; // Can be calculated based on business rules
    const totalAmount = subtotal + taxAmount;

    // Create purchase order
    const { data: purchaseOrder, error: poError } = await supabase
      .from('purchase_orders')
      .insert({
        business_id: businessId,
        supplier_id: supplierData.supplier_id,
        po_number: poNumberData,
        expected_delivery_date: supplierData.expected_delivery_date,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: supplierData.notes,
      })
      .select()
      .single();

    if (poError) {
      throw new Error(poError.message);
    }

    // Create purchase order items
    const poItems = items.map(item => ({
      purchase_order_id: purchaseOrder.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
      total_cost: item.quantity * item.unit_cost,
    }));

    const { data: createdItems, error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(poItems)
      .select(`
        *,
        product:products(id, name, sku)
      `);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    // Get supplier details
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', supplierData.supplier_id)
      .single();

    if (supplierError) {
      throw new Error(supplierError.message);
    }

    return {
      ...purchaseOrder,
      supplier,
      items: createdItems as any,
    };
  }

  async getPurchaseOrdersByBusinessId(businessId: string): Promise<PurchaseOrderWithDetails[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(*),
        items:purchase_order_items(
          *,
          product:products(id, name, sku)
        )
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data as any || [];
  }

  async getPurchaseOrderById(purchaseOrderId: string): Promise<PurchaseOrderWithDetails> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(*),
        items:purchase_order_items(
          *,
          product:products(id, name, sku)
        )
      `)
      .eq('id', purchaseOrderId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as any;
  }

  async updatePurchaseOrderStatus(
    purchaseOrderId: string, 
    status: PurchaseOrder['status']
  ): Promise<PurchaseOrder> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .update({ status })
      .eq('id', purchaseOrderId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Stock Receipt operations
  async createStockReceipt(
    businessId: string,
    receiptData: {
      purchase_order_id?: string;
      received_by?: string;
      notes?: string;
    },
    items: Array<{
      purchase_order_item_id?: string;
      product_id: string;
      quantity_ordered?: number;
      quantity_received: number;
      unit_cost: number;
    }>
  ): Promise<StockReceiptWithDetails> {
    // Generate receipt number
    const { data: receiptNumberData, error: receiptNumberError } = await supabase
      .rpc('generate_receipt_number', { business_id_param: businessId });

    if (receiptNumberError) {
      throw new Error(receiptNumberError.message);
    }

    // Create stock receipt
    const { data: stockReceipt, error: receiptError } = await supabase
      .from('stock_receipts')
      .insert({
        business_id: businessId,
        purchase_order_id: receiptData.purchase_order_id,
        receipt_number: receiptNumberData,
        received_by: receiptData.received_by,
        notes: receiptData.notes,
      })
      .select()
      .single();

    if (receiptError) {
      throw new Error(receiptError.message);
    }

    // Create stock receipt items
    const receiptItems = items.map(item => ({
      stock_receipt_id: stockReceipt.id,
      purchase_order_item_id: item.purchase_order_item_id,
      product_id: item.product_id,
      quantity_ordered: item.quantity_ordered || 0,
      quantity_received: item.quantity_received,
      unit_cost: item.unit_cost,
      total_cost: item.quantity_received * item.unit_cost,
    }));

    const { data: createdReceiptItems, error: receiptItemsError } = await supabase
      .from('stock_receipt_items')
      .insert(receiptItems)
      .select(`
        *,
        product:products(id, name, sku)
      `);

    if (receiptItemsError) {
      throw new Error(receiptItemsError.message);
    }

    // Process inventory movements for each received item
    for (const item of items) {
      await inventoryValuationService.recordInventoryMovement({
        product_id: item.product_id,
        movement_type: 'purchase',
        quantity: item.quantity_received,
        unit_cost: item.unit_cost,
        total_cost: item.quantity_received * item.unit_cost,
        reference_id: stockReceipt.id,
        date: stockReceipt.receipt_date,
        notes: `Stock receipt: ${stockReceipt.receipt_number}`,
      });

      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({
          current_stock: supabase.sql`current_stock + ${item.quantity_received}`,
        })
        .eq('id', item.product_id);

      if (updateError) {
        console.error('Error updating product stock:', updateError);
      }
    }

    // Update purchase order item quantities received
    if (receiptData.purchase_order_id) {
      for (const item of items) {
        if (item.purchase_order_item_id) {
          await supabase
            .from('purchase_order_items')
            .update({
              quantity_received: supabase.sql`quantity_received + ${item.quantity_received}`,
            })
            .eq('id', item.purchase_order_item_id);
        }
      }

      // Update purchase order status based on received quantities
      await this.updatePurchaseOrderStatusBasedOnReceipts(receiptData.purchase_order_id);
    }

    // Mark receipt as completed
    await supabase
      .from('stock_receipts')
      .update({ status: 'completed' })
      .eq('id', stockReceipt.id);

    // Get complete receipt details
    return this.getStockReceiptById(stockReceipt.id);
  }

  async getStockReceiptsByBusinessId(businessId: string): Promise<StockReceiptWithDetails[]> {
    const { data, error } = await supabase
      .from('stock_receipts')
      .select(`
        *,
        purchase_order:purchase_orders(
          *,
          supplier:suppliers(*)
        ),
        items:stock_receipt_items(
          *,
          product:products(id, name, sku)
        )
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data as any || [];
  }

  async getStockReceiptById(receiptId: string): Promise<StockReceiptWithDetails> {
    const { data, error } = await supabase
      .from('stock_receipts')
      .select(`
        *,
        purchase_order:purchase_orders(
          *,
          supplier:suppliers(*)
        ),
        items:stock_receipt_items(
          *,
          product:products(id, name, sku)
        )
      `)
      .eq('id', receiptId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as any;
  }

  // Helper method to update PO status based on received quantities
  private async updatePurchaseOrderStatusBasedOnReceipts(purchaseOrderId: string): Promise<void> {
    const { data: items, error } = await supabase
      .from('purchase_order_items')
      .select('quantity, quantity_received')
      .eq('purchase_order_id', purchaseOrderId);

    if (error || !items) return;

    const totalOrdered = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalReceived = items.reduce((sum, item) => sum + item.quantity_received, 0);

    let newStatus: PurchaseOrder['status'];
    if (totalReceived === 0) {
      newStatus = 'confirmed';
    } else if (totalReceived >= totalOrdered) {
      newStatus = 'received';
    } else {
      newStatus = 'partially_received';
    }

    await this.updatePurchaseOrderStatus(purchaseOrderId, newStatus);
  }

  // Get pending purchase orders (for receiving)
  async getPendingPurchaseOrders(businessId: string): Promise<PurchaseOrderWithDetails[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(*),
        items:purchase_order_items(
          *,
          product:products(id, name, sku)
        )
      `)
      .eq('business_id', businessId)
      .in('status', ['confirmed', 'partially_received'])
      .order('expected_delivery_date', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data as any || [];
  }

  // Get low stock products for reordering
  async getLowStockProducts(businessId: string): Promise<Array<{
    product: any;
    suggested_order_quantity: number;
    preferred_supplier?: Supplier;
  }>> {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', businessId)
      .lte('current_stock', supabase.sql`low_stock_threshold`);

    if (error) {
      throw new Error(error.message);
    }

    if (!products) return [];

    // Calculate suggested order quantities (simple logic - can be enhanced)
    return products.map(product => ({
      product,
      suggested_order_quantity: Math.max(
        product.low_stock_threshold * 2 - product.current_stock,
        product.low_stock_threshold
      ),
    }));
  }

  // Initialize sample suppliers for new businesses
  async initializeSampleSuppliers(businessId: string): Promise<void> {
    const sampleSuppliers = [
      {
        business_id: businessId,
        name: 'Fashion Wholesale Ltd',
        contact_person: 'John Smith',
        email: 'orders@fashionwholesale.com',
        phone: '+234-801-234-5678',
        payment_terms: 'Net 30',
        notes: 'Primary clothing supplier',
      },
      {
        business_id: businessId,
        name: 'Accessories Direct',
        contact_person: 'Sarah Johnson',
        email: 'sales@accessoriesdirect.com',
        phone: '+234-802-345-6789',
        payment_terms: 'Net 15',
        notes: 'Accessories and jewelry supplier',
      },
      {
        business_id: businessId,
        name: 'Local Craft Supplies',
        contact_person: 'Mike Chen',
        email: 'info@localcraft.com',
        phone: '+234-803-456-7890',
        payment_terms: 'COD',
        notes: 'Local supplier for craft items',
      },
    ];

    for (const supplier of sampleSuppliers) {
      try {
        await this.createSupplier(supplier);
      } catch (error) {
        console.error('Error creating sample supplier:', error);
      }
    }
  }
}

// Export singleton instance
export const purchaseOrdersService = new PurchaseOrdersService();