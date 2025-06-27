import { useState, useCallback } from 'react';

interface OptimisticUpdate<T> {
  id: string;
  data: T;
  type: 'create' | 'update' | 'delete';
  timestamp: Date;
}

export const useOptimisticUpdates = <T extends { id: string }>(
  initialData: T[] = []
) => {
  const [data, setData] = useState<T[]>(initialData);
  const [pendingUpdates, setPendingUpdates] = useState<OptimisticUpdate<T>[]>([]);

  const addOptimisticUpdate = useCallback((
    type: 'create' | 'update' | 'delete',
    item: T,
    updateFn: () => Promise<T>
  ) => {
    const updateId = `${type}_${item.id}_${Date.now()}`;
    
    // Apply optimistic update immediately
    setData(prev => {
      switch (type) {
        case 'create':
          return [...prev, item];
        case 'update':
          return prev.map(existing => existing.id === item.id ? item : existing);
        case 'delete':
          return prev.filter(existing => existing.id !== item.id);
        default:
          return prev;
      }
    });

    // Track pending update
    const update: OptimisticUpdate<T> = {
      id: updateId,
      data: item,
      type,
      timestamp: new Date()
    };
    
    setPendingUpdates(prev => [...prev, update]);

    // Execute actual update
    updateFn()
      .then((result) => {
        // Update with real data from server
        setData(prev => {
          switch (type) {
            case 'create':
            case 'update':
              return prev.map(existing => existing.id === item.id ? result : existing);
            default:
              return prev;
          }
        });
      })
      .catch((error) => {
        console.error('Optimistic update failed:', error);
        
        // Revert optimistic update
        setData(prev => {
          switch (type) {
            case 'create':
              return prev.filter(existing => existing.id !== item.id);
            case 'update':
              // Would need original data to revert properly
              return prev;
            case 'delete':
              return [...prev, item];
            default:
              return prev;
          }
        });
      })
      .finally(() => {
        // Remove from pending updates
        setPendingUpdates(prev => prev.filter(u => u.id !== updateId));
      });

    return updateId;
  }, []);

  const isPending = useCallback((itemId: string) => {
    return pendingUpdates.some(update => update.data.id === itemId);
  }, [pendingUpdates]);

  return {
    data,
    setData,
    addOptimisticUpdate,
    isPending,
    pendingUpdates
  };
};