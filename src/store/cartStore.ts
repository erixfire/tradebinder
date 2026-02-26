import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  inventory_id: number;
  card_id: number;
  card_name: string;
  set_code: string;
  condition: string;
  quantity: number;
  unit_price: number;
  image_uri?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (inventory_id: number) => void;
  updateQuantity: (inventory_id: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existing = state.items.find((i) => i.inventory_id === item.inventory_id);
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.inventory_id === item.inventory_id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (inventory_id) => set((state) => ({
        items: state.items.filter((i) => i.inventory_id !== inventory_id),
      })),
      updateQuantity: (inventory_id, quantity) => set((state) => ({
        items: state.items.map((i) =>
          i.inventory_id === inventory_id ? { ...i, quantity } : i
        ),
      })),
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const items = get().items;
        return items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
