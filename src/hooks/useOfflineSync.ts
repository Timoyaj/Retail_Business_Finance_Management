import { useState, useEffect, useCallback } from 'react';
import { usePWA } from './usePWA';

interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: Date;
  retryCount: number;
}

export const useOfflineSync = () => {
  const { isOnline } = usePWA();
  const [offlineActions, setOfflineActions] = useState<OfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load offline actions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('offlineActions');
    if (stored) {
      try {
        const actions = JSON.parse(stored);
        setOfflineActions(actions);
      } catch (error) {
        console.error('Failed to load offline actions:', error);
      }
    }
  }, []);

  // Save offline actions to localStorage
  useEffect(() => {
    localStorage.setItem('offlineActions', JSON.stringify(offlineActions));
  }, [offlineActions]);

  // Queue an action for offline sync
  const queueAction = useCallback((
    type: 'create' | 'update' | 'delete',
    table: string,
    data: any
  ) => {
    const action: OfflineAction = {
      id: `${type}_${table}_${Date.now()}_${Math.random()}`,
      type,
      table,
      data,
      timestamp: new Date(),
      retryCount: 0
    };

    setOfflineActions(prev => [...prev, action]);
    return action.id;
  }, []);

  // Sync offline actions when online
  const syncOfflineActions = useCallback(async () => {
    if (!isOnline || offlineActions.length === 0 || isSyncing) {
      return;
    }

    setIsSyncing(true);
    const successfulActions: string[] = [];

    for (const action of offlineActions) {
      try {
        // Here you would implement the actual sync logic
        // This is a placeholder for the sync implementation
        console.log('Syncing action:', action);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        
        successfulActions.push(action.id);
      } catch (error) {
        console.error('Failed to sync action:', action.id, error);
        
        // Increment retry count
        setOfflineActions(prev => 
          prev.map(a => 
            a.id === action.id 
              ? { ...a, retryCount: a.retryCount + 1 }
              : a
          )
        );
      }
    }

    // Remove successfully synced actions
    if (successfulActions.length > 0) {
      setOfflineActions(prev => 
        prev.filter(action => !successfulActions.includes(action.id))
      );
    }

    setIsSyncing(false);
  }, [isOnline, offlineActions, isSyncing]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && offlineActions.length > 0) {
      syncOfflineActions();
    }
  }, [isOnline, offlineActions.length, syncOfflineActions]);

  // Clear failed actions (after too many retries)
  const clearFailedActions = useCallback(() => {
    setOfflineActions(prev => prev.filter(action => action.retryCount < 3));
  }, []);

  return {
    offlineActions,
    queueAction,
    syncOfflineActions,
    clearFailedActions,
    isSyncing,
    hasOfflineActions: offlineActions.length > 0
  };
};