import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export const OfflineIndicator = () => {
  const { isOnline, pendingActions, syncPendingActions } = useOfflineSync();
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (!isOnline || pendingActions.length > 0) {
      setShowIndicator(true);
    } else {
      // Hide after a delay when back online and no pending actions
      const timer = setTimeout(() => setShowIndicator(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingActions.length]);

  if (!showIndicator) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
      >
        <div className={`p-3 rounded-xl border backdrop-blur-sm shadow-lg ${
          isOnline
            ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300'
            : 'bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-300'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-1 rounded-full ${
              isOnline ? 'bg-green-500/20' : 'bg-orange-500/20'
            }`}>
              {isOnline ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {isOnline ? 'Back Online' : 'You\'re Offline'}
              </p>
              {pendingActions.length > 0 && (
                <p className="text-xs opacity-80">
                  {pendingActions.length} action{pendingActions.length !== 1 ? 's' : ''} pending sync
                </p>
              )}
            </div>

            {isOnline && pendingActions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={syncPendingActions}
                className="h-8 px-2 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Sync
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};