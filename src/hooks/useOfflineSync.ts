import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface OfflineAction {
  id: string;
  type: 'message' | 'story' | 'like' | 'comment';
  data: any;
  timestamp: number;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing data...');
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline. Some features may be limited.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending actions from localStorage
    loadPendingActions();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingActions = () => {
    try {
      const stored = localStorage.getItem('clockit-offline-actions');
      if (stored) {
        setPendingActions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading pending actions:', error);
    }
  };

  const savePendingActions = (actions: OfflineAction[]) => {
    try {
      localStorage.setItem('clockit-offline-actions', JSON.stringify(actions));
      setPendingActions(actions);
    } catch (error) {
      console.error('Error saving pending actions:', error);
    }
  };

  const addPendingAction = (action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: Date.now()
    };

    const updatedActions = [...pendingActions, newAction];
    savePendingActions(updatedActions);

    // Register background sync if supported
    if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        (registration as any).sync.register(`background-sync-${action.type}`);
      });
    }

    return newAction.id;
  };

  const removePendingAction = (id: string) => {
    const updatedActions = pendingActions.filter(action => action.id !== id);
    savePendingActions(updatedActions);
  };

  const syncPendingActions = async () => {
    if (pendingActions.length === 0) return;

    let syncedCount = 0;

    for (const action of pendingActions) {
      try {
        await syncAction(action);
        removePendingAction(action.id);
        syncedCount++;
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
      }
    }

    if (syncedCount > 0) {
      toast.success(`Synced ${syncedCount} offline actions`);
    }
  };

  const syncAction = async (action: OfflineAction) => {
    switch (action.type) {
      case 'message':
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        break;

      case 'story':
        const formData = new FormData();
        if (action.data.image) formData.append('image', action.data.image);
        if (action.data.caption) formData.append('caption', action.data.caption);

        await fetch('/api/stories', {
          method: 'POST',
          body: formData
        });
        break;

      case 'like':
        await fetch(`/api/${action.data.type}/${action.data.id}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: action.data.userId })
        });
        break;

      case 'comment':
        await fetch(`/api/${action.data.type}/${action.data.id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: action.data.content, userId: action.data.userId })
        });
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  };

  return {
    isOnline,
    pendingActions,
    addPendingAction,
    removePendingAction,
    syncPendingActions
  };
};