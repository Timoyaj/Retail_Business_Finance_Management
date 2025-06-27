import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type TableName = keyof Database['public']['Tables'];

interface RealtimeHookOptions {
  table: TableName;
  filter?: {
    column: string;
    value: any;
  };
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export const useRealtimeData = <T = any>(options: RealtimeHookOptions) => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: any;

    const setupRealtime = async () => {
      try {
        // Initial data fetch
        let query = supabase.from(options.table).select('*');
        
        if (options.filter) {
          query = query.eq(options.filter.column, options.filter.value);
        }

        const { data: initialData, error: fetchError } = await query;
        
        if (fetchError) {
          throw fetchError;
        }

        setData(initialData || []);
        setError(null);

        // Set up real-time subscription
        const channel = supabase
          .channel(`${options.table}_changes`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: options.table,
              filter: options.filter ? `${options.filter.column}=eq.${options.filter.value}` : undefined
            },
            (payload) => {
              console.log('Real-time update:', payload);

              switch (payload.eventType) {
                case 'INSERT':
                  setData(prev => [...prev, payload.new as T]);
                  options.onInsert?.(payload);
                  break;
                
                case 'UPDATE':
                  setData(prev => 
                    prev.map(item => 
                      (item as any).id === payload.new.id ? payload.new as T : item
                    )
                  );
                  options.onUpdate?.(payload);
                  break;
                
                case 'DELETE':
                  setData(prev => 
                    prev.filter(item => (item as any).id !== payload.old.id)
                  );
                  options.onDelete?.(payload);
                  break;
              }
            }
          )
          .subscribe();

        subscription = channel;
      } catch (err) {
        console.error('Real-time setup error:', err);
        setError(err instanceof Error ? err.message : 'Failed to setup real-time data');
      } finally {
        setIsLoading(false);
      }
    };

    setupRealtime();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [options.table, options.filter?.column, options.filter?.value]);

  return { data, isLoading, error, setData };
};

// Specialized hooks for common use cases
export const useRealtimeTransactions = (businessId: string) => {
  return useRealtimeData({
    table: 'transactions',
    filter: { column: 'business_id', value: businessId },
    onInsert: (payload) => {
      console.log('New transaction added:', payload.new);
    },
    onUpdate: (payload) => {
      console.log('Transaction updated:', payload.new);
    }
  });
};

export const useRealtimeProducts = (businessId: string) => {
  return useRealtimeData({
    table: 'products',
    filter: { column: 'business_id', value: businessId },
    onInsert: (payload) => {
      console.log('New product added:', payload.new);
    },
    onUpdate: (payload) => {
      console.log('Product updated:', payload.new);
      // Could trigger low stock alerts here
      if (payload.new.current_stock <= payload.new.low_stock_threshold) {
        console.log('Low stock alert for:', payload.new.name);
      }
    }
  });
};

export const useRealtimePurchaseOrders = (businessId: string) => {
  return useRealtimeData({
    table: 'purchase_orders',
    filter: { column: 'business_id', value: businessId },
    onUpdate: (payload) => {
      console.log('Purchase order status updated:', payload.new);
      // Could trigger notifications for status changes
    }
  });
};