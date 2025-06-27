import { supabase } from './supabase';
import type { Database } from './supabase';

// Type definitions for inventory valuation
export interface InventoryMovement {
  id: string;
  product_id: string;
  movement_type: 'purchase' | 'sale' | 'adjustment' | 'transfer';
  quantity: number;
  unit_cost: number;
  total_cost: number;
  reference_id?: string; // Transaction ID or other reference
  date: string;
  notes?: string;
  created_at: string;
}

export interface InventoryLayer {
  id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  purchase_date: string;
  remaining_quantity: number;
  created_at: string;
}

export interface ValuationResult {
  method: 'FIFO' | 'WEIGHTED_AVERAGE';
  totalQuantity: number;
  totalValue: number;
  averageCost: number;
  layers?: InventoryLayer[];
}

export interface CostOfGoodsSold {
  quantity: number;
  totalCost: number;
  averageCost: number;
  layers: Array<{
    layer_id: string;
    quantity: number;
    unit_cost: number;
    total_cost: number;
  }>;
}

// Inventory Valuation Service
class InventoryValuationService {
  // Record inventory movement
  async recordInventoryMovement(movementData: Omit<InventoryMovement, 'id' | 'created_at'>): Promise<InventoryMovement> {
    const { data, error } = await supabase
      .from('inventory_movements')
      .insert(movementData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Update inventory layers based on movement type
    if (movementData.movement_type === 'purchase') {
      await this.addInventoryLayer({
        product_id: movementData.product_id,
        quantity: movementData.quantity,
        unit_cost: movementData.unit_cost,
        total_cost: movementData.total_cost,
        purchase_date: movementData.date,
        remaining_quantity: movementData.quantity
      });
    } else if (movementData.movement_type === 'sale') {
      await this.processInventorySale(
        movementData.product_id,
        movementData.quantity,
        movementData.date
      );
    }

    return data;
  }

  // Add new inventory layer (for purchases)
  private async addInventoryLayer(layerData: Omit<InventoryLayer, 'id' | 'created_at'>): Promise<InventoryLayer> {
    const { data, error } = await supabase
      .from('inventory_layers')
      .insert(layerData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Process inventory sale using FIFO method
  private async processInventorySale(productId: string, quantitySold: number, saleDate: string): Promise<CostOfGoodsSold> {
    // Get available inventory layers ordered by purchase date (FIFO)
    const { data: layers, error } = await supabase
      .from('inventory_layers')
      .select('*')
      .eq('product_id', productId)
      .gt('remaining_quantity', 0)
      .order('purchase_date', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    if (!layers || layers.length === 0) {
      throw new Error('No inventory available for sale');
    }

    let remainingToSell = quantitySold;
    const cogsLayers: CostOfGoodsSold['layers'] = [];
    let totalCost = 0;

    // Process layers in FIFO order
    for (const layer of layers) {
      if (remainingToSell <= 0) break;

      const quantityFromThisLayer = Math.min(remainingToSell, layer.remaining_quantity);
      const costFromThisLayer = quantityFromThisLayer * layer.unit_cost;

      cogsLayers.push({
        layer_id: layer.id,
        quantity: quantityFromThisLayer,
        unit_cost: layer.unit_cost,
        total_cost: costFromThisLayer
      });

      totalCost += costFromThisLayer;
      remainingToSell -= quantityFromThisLayer;

      // Update the layer's remaining quantity
      await supabase
        .from('inventory_layers')
        .update({ 
          remaining_quantity: layer.remaining_quantity - quantityFromThisLayer 
        })
        .eq('id', layer.id);
    }

    if (remainingToSell > 0) {
      throw new Error(`Insufficient inventory. Missing ${remainingToSell} units.`);
    }

    return {
      quantity: quantitySold,
      totalCost,
      averageCost: totalCost / quantitySold,
      layers: cogsLayers
    };
  }

  // Calculate inventory valuation using FIFO method
  async calculateFIFOValuation(productId: string): Promise<ValuationResult> {
    const { data: layers, error } = await supabase
      .from('inventory_layers')
      .select('*')
      .eq('product_id', productId)
      .gt('remaining_quantity', 0)
      .order('purchase_date', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    if (!layers || layers.length === 0) {
      return {
        method: 'FIFO',
        totalQuantity: 0,
        totalValue: 0,
        averageCost: 0,
        layers: []
      };
    }

    const totalQuantity = layers.reduce((sum, layer) => sum + layer.remaining_quantity, 0);
    const totalValue = layers.reduce((sum, layer) => sum + (layer.remaining_quantity * layer.unit_cost), 0);
    const averageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;

    return {
      method: 'FIFO',
      totalQuantity,
      totalValue,
      averageCost,
      layers
    };
  }

  // Calculate inventory valuation using Weighted Average method
  async calculateWeightedAverageValuation(productId: string): Promise<ValuationResult> {
    const { data: movements, error } = await supabase
      .from('inventory_movements')
      .select('*')
      .eq('product_id', productId)
      .eq('movement_type', 'purchase')
      .order('date', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    if (!movements || movements.length === 0) {
      return {
        method: 'WEIGHTED_AVERAGE',
        totalQuantity: 0,
        totalValue: 0,
        averageCost: 0
      };
    }

    // Calculate weighted average cost
    const totalCost = movements.reduce((sum, movement) => sum + movement.total_cost, 0);
    const totalQuantityPurchased = movements.reduce((sum, movement) => sum + movement.quantity, 0);
    
    // Get total quantity sold
    const { data: sales, error: salesError } = await supabase
      .from('inventory_movements')
      .select('quantity')
      .eq('product_id', productId)
      .eq('movement_type', 'sale');

    if (salesError) {
      throw new Error(salesError.message);
    }

    const totalQuantitySold = sales?.reduce((sum, sale) => sum + sale.quantity, 0) || 0;
    const currentQuantity = totalQuantityPurchased - totalQuantitySold;
    const averageCost = totalQuantityPurchased > 0 ? totalCost / totalQuantityPurchased : 0;
    const currentValue = currentQuantity * averageCost;

    return {
      method: 'WEIGHTED_AVERAGE',
      totalQuantity: currentQuantity,
      totalValue: currentValue,
      averageCost
    };
  }

  // Get inventory movements for a product
  async getInventoryMovements(productId: string, limit?: number): Promise<InventoryMovement[]> {
    let query = supabase
      .from('inventory_movements')
      .select('*')
      .eq('product_id', productId)
      .order('date', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // Get inventory layers for a product
  async getInventoryLayers(productId: string): Promise<InventoryLayer[]> {
    const { data, error } = await supabase
      .from('inventory_layers')
      .select('*')
      .eq('product_id', productId)
      .gt('remaining_quantity', 0)
      .order('purchase_date', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // Calculate COGS for a sale using FIFO
  async calculateCOGSForSale(productId: string, quantitySold: number): Promise<CostOfGoodsSold> {
    return this.processInventorySale(productId, quantitySold, new Date().toISOString());
  }

  // Get inventory summary for all products in a business
  async getInventorySummary(businessId: string, method: 'FIFO' | 'WEIGHTED_AVERAGE' = 'FIFO'): Promise<Array<{
    product: any;
    valuation: ValuationResult;
  }>> {
    // Get all products for the business
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', businessId);

    if (error) {
      throw new Error(error.message);
    }

    if (!products) return [];

    const summary = [];

    for (const product of products) {
      let valuation: ValuationResult;
      
      if (method === 'FIFO') {
        valuation = await this.calculateFIFOValuation(product.id);
      } else {
        valuation = await this.calculateWeightedAverageValuation(product.id);
      }

      summary.push({
        product,
        valuation
      });
    }

    return summary;
  }

  // Adjust inventory (for corrections, damages, etc.)
  async adjustInventory(
    productId: string,
    quantityAdjustment: number,
    reason: string,
    unitCost?: number
  ): Promise<InventoryMovement> {
    const adjustmentCost = unitCost || 0;
    const totalCost = quantityAdjustment * adjustmentCost;

    return this.recordInventoryMovement({
      product_id: productId,
      movement_type: 'adjustment',
      quantity: quantityAdjustment,
      unit_cost: adjustmentCost,
      total_cost: totalCost,
      date: new Date().toISOString(),
      notes: reason
    });
  }

  // Initialize inventory tracking for existing products
  async initializeInventoryTracking(businessId: string): Promise<void> {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', businessId);

    if (error) {
      throw new Error(error.message);
    }

    if (!products) return;

    for (const product of products) {
      if (product.current_stock > 0) {
        // Create initial inventory layer with current stock
        await this.recordInventoryMovement({
          product_id: product.id,
          movement_type: 'adjustment',
          quantity: product.current_stock,
          unit_cost: product.cost_price,
          total_cost: product.current_stock * product.cost_price,
          date: new Date().toISOString(),
          notes: 'Initial inventory setup'
        });
      }
    }
  }
}

// Export singleton instance
export const inventoryValuationService = new InventoryValuationService();