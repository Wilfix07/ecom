import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      // Add item to cart
      addToCart: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find(item => item.id === product.id);
        
        if (existingItem) {
          // Update quantity if item already exists
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          // Add new item
          set({
            items: [...items, { ...product, quantity }],
          });
        }
      },
      
      // Remove item from cart
      removeFromCart: (productId) => {
        set({
          items: get().items.filter(item => item.id !== productId),
        });
      },
      
      // Update item quantity
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },
      
      // Clear cart
      clearCart: () => {
        set({ items: [] });
      },
      
      // Toggle cart open/close
      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },
      
      openCart: () => {
        set({ isOpen: true });
      },
      
      closeCart: () => {
        set({ isOpen: false });
      },
      
      // Get cart total
      getTotal: () => {
        const items = get().items;
        return items.reduce((total, item) => {
          const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
          return total + (discountedPrice * item.quantity);
        }, 0);
      },
      
      // Get cart items count
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      
      // Check if product is in cart
      isInCart: (productId) => {
        return get().items.some(item => item.id === productId);
      },
    }),
    {
      name: 'cart-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);

export default useCartStore;

