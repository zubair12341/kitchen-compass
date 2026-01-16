import { useEffect, useRef } from 'react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { toast } from 'sonner';

export function useOrderNotifications() {
  const orders = useRestaurantStore((state) => state.orders);
  const previousOrdersRef = useRef(orders);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdWtwcHJ+gIR/fHZ9goqNjYiEfXV3e4GAgoF/fHl3dnl9goaJioqHg35+fn+BgoKCgYB+fH17fX+ChYeIiIeEgX5+foCBg4ODgoB/fnx9foGDhoiIiIaDgH1+f4GDhISEgoB+fXx+gIOGiIiHhYJ/fn5/gYOEhISCgH5+fX+Bg4WHiIeFg39+foCBg4SEg4KAfn19f4GEhoiIh4WCfn5+gIKEhISDgX9+fH6AgoWHiIiGg4B+fn+BgoSEhIKAfn18foKEhoiIhoSAfn5/gYKDhISCgX5+fX6Bg4aIiIeEgn5+f4CCg4ODgYF/fn1+gYSGh4iGg4B+fn+Bg4OEg4KAfn59f4KEhoiHhYOAfn5/gYOEhIOBgH5+foCCho==');
    audioRef.current.volume = 0.5;
    
    return () => {
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    // Skip first render to avoid notification on page load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousOrdersRef.current = orders;
      return;
    }

    const previousOrders = previousOrdersRef.current;
    
    // Find new pending orders (online or takeaway)
    const newOrders = orders.filter((order) => {
      const wasExisting = previousOrders.find((prev) => prev.id === order.id);
      const isNewPending = !wasExisting && 
        order.status === 'pending' && 
        (order.orderType === 'online' || order.orderType === 'takeaway');
      return isNewPending;
    });

    // Play sound and show toast for each new order
    newOrders.forEach((order) => {
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          // Audio play might be blocked by browser
          console.log('Audio notification blocked by browser');
        });
      }

      // Show toast notification
      const orderTypeLabel = order.orderType === 'online' ? '🌐 Online Order' : '🛍️ Takeaway Order';
      toast.success(`New ${orderTypeLabel}`, {
        description: `Order ${order.orderNumber} - ${order.customerName || 'Customer'} - Total: ₨ ${order.total.toLocaleString()}`,
        duration: 10000,
        action: {
          label: 'View',
          onClick: () => {
            window.location.href = order.orderType === 'online' ? '/online-orders' : '/takeaway-orders';
          },
        },
      });
    });

    previousOrdersRef.current = orders;
  }, [orders]);

  // Function to manually play notification sound (for testing)
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  };

  return { playNotificationSound };
}
