import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Ingredient,
  MenuItem,
  MenuCategory,
  CartItem,
  Order,
  StockTransfer,
  LowStockAlert,
  IngredientCategory,
} from '@/types/restaurant';

interface RestaurantState {
  // Ingredients
  ingredients: Ingredient[];
  ingredientCategories: IngredientCategory[];
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;

  // Stock Management
  addStoreStock: (ingredientId: string, quantity: number, reason?: string) => void;
  transferToKitchen: (ingredientId: string, quantity: number) => void;
  deductKitchenStock: (ingredientId: string, quantity: number) => void;
  stockTransfers: StockTransfer[];

  // Menu Items
  menuItems: MenuItem[];
  menuCategories: MenuCategory[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt' | 'recipeCost' | 'profitMargin'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  addMenuCategory: (category: Omit<MenuCategory, 'id'>) => void;
  deleteMenuCategory: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (menuItem: MenuItem) => void;
  updateCartItemQuantity: (menuItemId: string, quantity: number) => void;
  removeFromCart: (menuItemId: string) => void;
  clearCart: () => void;
  addCartItemNote: (menuItemId: string, note: string) => void;

  // Orders
  orders: Order[];
  completeOrder: (orderDetails: {
    paymentMethod: 'cash' | 'card' | 'mobile';
    customerName?: string;
    tableNumber?: string;
    orderType: 'dine-in' | 'takeaway' | 'delivery';
    discount?: number;
  }) => Order | null;
  cancelOrder: (orderId: string) => void;

  // Calculations
  calculateRecipeCost: (recipe: { ingredientId: string; quantity: number }[]) => number;
  getLowStockAlerts: () => LowStockAlert[];
  getTodaysSales: () => { orders: number; revenue: number; cost: number; profit: number };
}

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateOrderNumber = () => `ORD-${Date.now().toString(36).toUpperCase()}`;

// Sample data
const initialIngredientCategories: IngredientCategory[] = [
  { id: 'meat', name: 'Meat & Poultry' },
  { id: 'seafood', name: 'Seafood' },
  { id: 'vegetables', name: 'Vegetables' },
  { id: 'dairy', name: 'Dairy' },
  { id: 'grains', name: 'Grains & Pasta' },
  { id: 'spices', name: 'Spices & Seasonings' },
  { id: 'sauces', name: 'Sauces & Oils' },
  { id: 'beverages', name: 'Beverages' },
];

const initialIngredients: Ingredient[] = [
  { id: '1', name: 'Chicken Breast', unit: 'kg', costPerUnit: 8.50, storeStock: 25, kitchenStock: 5, lowStockThreshold: 10, category: 'meat', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Beef Tenderloin', unit: 'kg', costPerUnit: 25.00, storeStock: 15, kitchenStock: 3, lowStockThreshold: 5, category: 'meat', createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'Salmon Fillet', unit: 'kg', costPerUnit: 18.00, storeStock: 10, kitchenStock: 2, lowStockThreshold: 5, category: 'seafood', createdAt: new Date(), updatedAt: new Date() },
  { id: '4', name: 'Shrimp', unit: 'kg', costPerUnit: 15.00, storeStock: 8, kitchenStock: 2, lowStockThreshold: 5, category: 'seafood', createdAt: new Date(), updatedAt: new Date() },
  { id: '5', name: 'Fresh Tomatoes', unit: 'kg', costPerUnit: 3.50, storeStock: 20, kitchenStock: 8, lowStockThreshold: 10, category: 'vegetables', createdAt: new Date(), updatedAt: new Date() },
  { id: '6', name: 'Onions', unit: 'kg', costPerUnit: 2.00, storeStock: 30, kitchenStock: 10, lowStockThreshold: 15, category: 'vegetables', createdAt: new Date(), updatedAt: new Date() },
  { id: '7', name: 'Garlic', unit: 'kg', costPerUnit: 8.00, storeStock: 5, kitchenStock: 1, lowStockThreshold: 3, category: 'vegetables', createdAt: new Date(), updatedAt: new Date() },
  { id: '8', name: 'Mozzarella Cheese', unit: 'kg', costPerUnit: 12.00, storeStock: 8, kitchenStock: 2, lowStockThreshold: 5, category: 'dairy', createdAt: new Date(), updatedAt: new Date() },
  { id: '9', name: 'Heavy Cream', unit: 'L', costPerUnit: 4.50, storeStock: 10, kitchenStock: 3, lowStockThreshold: 5, category: 'dairy', createdAt: new Date(), updatedAt: new Date() },
  { id: '10', name: 'Pasta Spaghetti', unit: 'kg', costPerUnit: 2.50, storeStock: 20, kitchenStock: 5, lowStockThreshold: 10, category: 'grains', createdAt: new Date(), updatedAt: new Date() },
  { id: '11', name: 'Basmati Rice', unit: 'kg', costPerUnit: 3.00, storeStock: 25, kitchenStock: 8, lowStockThreshold: 10, category: 'grains', createdAt: new Date(), updatedAt: new Date() },
  { id: '12', name: 'Olive Oil', unit: 'L', costPerUnit: 10.00, storeStock: 5, kitchenStock: 2, lowStockThreshold: 3, category: 'sauces', createdAt: new Date(), updatedAt: new Date() },
  { id: '13', name: 'Tomato Sauce', unit: 'L', costPerUnit: 3.00, storeStock: 12, kitchenStock: 4, lowStockThreshold: 6, category: 'sauces', createdAt: new Date(), updatedAt: new Date() },
  { id: '14', name: 'Black Pepper', unit: 'kg', costPerUnit: 25.00, storeStock: 2, kitchenStock: 0.5, lowStockThreshold: 1, category: 'spices', createdAt: new Date(), updatedAt: new Date() },
  { id: '15', name: 'Salt', unit: 'kg', costPerUnit: 1.50, storeStock: 10, kitchenStock: 3, lowStockThreshold: 5, category: 'spices', createdAt: new Date(), updatedAt: new Date() },
];

const initialMenuCategories: MenuCategory[] = [
  { id: 'appetizers', name: 'Appetizers', icon: '🥗', color: '#22c55e', sortOrder: 1 },
  { id: 'main-course', name: 'Main Course', icon: '🍽️', color: '#f97316', sortOrder: 2 },
  { id: 'pasta', name: 'Pasta', icon: '🍝', color: '#eab308', sortOrder: 3 },
  { id: 'seafood', name: 'Seafood', icon: '🦐', color: '#3b82f6', sortOrder: 4 },
  { id: 'desserts', name: 'Desserts', icon: '🍰', color: '#ec4899', sortOrder: 5 },
  { id: 'beverages', name: 'Beverages', icon: '🥤', color: '#8b5cf6', sortOrder: 6 },
];

const initialMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Grilled Chicken',
    description: 'Tender grilled chicken breast with herbs',
    price: 18.99,
    categoryId: 'main-course',
    recipe: [
      { ingredientId: '1', quantity: 0.25 },
      { ingredientId: '12', quantity: 0.02 },
      { ingredientId: '14', quantity: 0.005 },
      { ingredientId: '15', quantity: 0.01 },
    ],
    recipeCost: 2.85,
    profitMargin: 85,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Beef Steak',
    description: 'Premium beef tenderloin cooked to perfection',
    price: 32.99,
    categoryId: 'main-course',
    recipe: [
      { ingredientId: '2', quantity: 0.3 },
      { ingredientId: '12', quantity: 0.02 },
      { ingredientId: '14', quantity: 0.005 },
    ],
    recipeCost: 7.82,
    profitMargin: 76,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Spaghetti Carbonara',
    description: 'Classic Italian pasta with creamy sauce',
    price: 16.99,
    categoryId: 'pasta',
    recipe: [
      { ingredientId: '10', quantity: 0.15 },
      { ingredientId: '9', quantity: 0.1 },
      { ingredientId: '8', quantity: 0.05 },
    ],
    recipeCost: 1.52,
    profitMargin: 91,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with lemon butter',
    price: 28.99,
    categoryId: 'seafood',
    recipe: [
      { ingredientId: '3', quantity: 0.2 },
      { ingredientId: '12', quantity: 0.02 },
    ],
    recipeCost: 3.80,
    profitMargin: 87,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Shrimp Scampi',
    description: 'Garlic butter shrimp with pasta',
    price: 24.99,
    categoryId: 'seafood',
    recipe: [
      { ingredientId: '4', quantity: 0.15 },
      { ingredientId: '10', quantity: 0.1 },
      { ingredientId: '7', quantity: 0.02 },
      { ingredientId: '12', quantity: 0.03 },
    ],
    recipeCost: 3.01,
    profitMargin: 88,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    name: 'Caesar Salad',
    description: 'Fresh romaine with parmesan and croutons',
    price: 12.99,
    categoryId: 'appetizers',
    recipe: [
      { ingredientId: '8', quantity: 0.03 },
      { ingredientId: '12', quantity: 0.02 },
    ],
    recipeCost: 0.56,
    profitMargin: 96,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    name: 'Tomato Bruschetta',
    description: 'Toasted bread with fresh tomatoes and basil',
    price: 9.99,
    categoryId: 'appetizers',
    recipe: [
      { ingredientId: '5', quantity: 0.1 },
      { ingredientId: '7', quantity: 0.01 },
      { ingredientId: '12', quantity: 0.02 },
    ],
    recipeCost: 0.63,
    profitMargin: 94,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '8',
    name: 'Chicken Alfredo',
    description: 'Creamy pasta with grilled chicken',
    price: 19.99,
    categoryId: 'pasta',
    recipe: [
      { ingredientId: '1', quantity: 0.15 },
      { ingredientId: '10', quantity: 0.12 },
      { ingredientId: '9', quantity: 0.1 },
      { ingredientId: '8', quantity: 0.04 },
    ],
    recipeCost: 2.40,
    profitMargin: 88,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set, get) => ({
      // Initial Data
      ingredients: initialIngredients,
      ingredientCategories: initialIngredientCategories,
      menuItems: initialMenuItems,
      menuCategories: initialMenuCategories,
      cart: [],
      orders: [],
      stockTransfers: [],

      // Ingredient Management
      addIngredient: (ingredient) => {
        const newIngredient: Ingredient = {
          ...ingredient,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          ingredients: [...state.ingredients, newIngredient],
        }));
      },

      updateIngredient: (id, updates) => {
        set((state) => ({
          ingredients: state.ingredients.map((ing) =>
            ing.id === id ? { ...ing, ...updates, updatedAt: new Date() } : ing
          ),
        }));
      },

      deleteIngredient: (id) => {
        set((state) => ({
          ingredients: state.ingredients.filter((ing) => ing.id !== id),
        }));
      },

      // Stock Management
      addStoreStock: (ingredientId, quantity, reason = 'Stock received') => {
        set((state) => ({
          ingredients: state.ingredients.map((ing) =>
            ing.id === ingredientId
              ? { ...ing, storeStock: ing.storeStock + quantity, updatedAt: new Date() }
              : ing
          ),
          stockTransfers: [
            ...state.stockTransfers,
            {
              id: generateId(),
              ingredientId,
              quantity,
              fromLocation: 'store' as const,
              toLocation: 'store' as const,
              reason,
              createdAt: new Date(),
            },
          ],
        }));
      },

      transferToKitchen: (ingredientId, quantity) => {
        set((state) => {
          const ingredient = state.ingredients.find((i) => i.id === ingredientId);
          if (!ingredient || ingredient.storeStock < quantity) return state;

          return {
            ingredients: state.ingredients.map((ing) =>
              ing.id === ingredientId
                ? {
                    ...ing,
                    storeStock: ing.storeStock - quantity,
                    kitchenStock: ing.kitchenStock + quantity,
                    updatedAt: new Date(),
                  }
                : ing
            ),
            stockTransfers: [
              ...state.stockTransfers,
              {
                id: generateId(),
                ingredientId,
                quantity,
                fromLocation: 'store' as const,
                toLocation: 'kitchen' as const,
                reason: 'Transfer to kitchen',
                createdAt: new Date(),
              },
            ],
          };
        });
      },

      deductKitchenStock: (ingredientId, quantity) => {
        set((state) => ({
          ingredients: state.ingredients.map((ing) =>
            ing.id === ingredientId
              ? { ...ing, kitchenStock: Math.max(0, ing.kitchenStock - quantity), updatedAt: new Date() }
              : ing
          ),
        }));
      },

      // Menu Management
      addMenuItem: (item) => {
        const recipeCost = get().calculateRecipeCost(item.recipe);
        const profitMargin = ((item.price - recipeCost) / item.price) * 100;
        const newItem: MenuItem = {
          ...item,
          id: generateId(),
          recipeCost,
          profitMargin,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          menuItems: [...state.menuItems, newItem],
        }));
      },

      updateMenuItem: (id, updates) => {
        set((state) => {
          const existingItem = state.menuItems.find((item) => item.id === id);
          if (!existingItem) return state;

          const recipe = updates.recipe || existingItem.recipe;
          const price = updates.price || existingItem.price;
          const recipeCost = get().calculateRecipeCost(recipe);
          const profitMargin = ((price - recipeCost) / price) * 100;

          return {
            menuItems: state.menuItems.map((item) =>
              item.id === id
                ? { ...item, ...updates, recipeCost, profitMargin, updatedAt: new Date() }
                : item
            ),
          };
        });
      },

      deleteMenuItem: (id) => {
        set((state) => ({
          menuItems: state.menuItems.filter((item) => item.id !== id),
        }));
      },

      addMenuCategory: (category) => {
        const newCategory: MenuCategory = {
          ...category,
          id: generateId(),
        };
        set((state) => ({
          menuCategories: [...state.menuCategories, newCategory],
        }));
      },

      deleteMenuCategory: (id) => {
        set((state) => ({
          menuCategories: state.menuCategories.filter((cat) => cat.id !== id),
        }));
      },

      // Cart Management
      addToCart: (menuItem) => {
        set((state) => {
          const existingItem = state.cart.find((item) => item.menuItem.id === menuItem.id);
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.menuItem.id === menuItem.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return {
            cart: [...state.cart, { menuItem, quantity: 1 }],
          };
        });
      },

      updateCartItemQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(menuItemId);
          return;
        }
        set((state) => ({
          cart: state.cart.map((item) =>
            item.menuItem.id === menuItemId ? { ...item, quantity } : item
          ),
        }));
      },

      removeFromCart: (menuItemId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.menuItem.id !== menuItemId),
        }));
      },

      clearCart: () => set({ cart: [] }),

      addCartItemNote: (menuItemId, note) => {
        set((state) => ({
          cart: state.cart.map((item) =>
            item.menuItem.id === menuItemId ? { ...item, notes: note } : item
          ),
        }));
      },

      // Order Management
      completeOrder: (orderDetails) => {
        const { cart, ingredients } = get();
        if (cart.length === 0) return null;

        const subtotal = cart.reduce(
          (sum, item) => sum + item.menuItem.price * item.quantity,
          0
        );
        const tax = subtotal * 0.1; // 10% tax
        const discount = orderDetails.discount || 0;
        const total = subtotal + tax - discount;

        const order: Order = {
          id: generateId(),
          orderNumber: generateOrderNumber(),
          items: cart.map((item) => ({
            menuItemId: item.menuItem.id,
            menuItemName: item.menuItem.name,
            quantity: item.quantity,
            unitPrice: item.menuItem.price,
            total: item.menuItem.price * item.quantity,
            notes: item.notes,
          })),
          subtotal,
          tax,
          discount,
          total,
          paymentMethod: orderDetails.paymentMethod,
          status: 'completed',
          customerName: orderDetails.customerName,
          tableNumber: orderDetails.tableNumber,
          orderType: orderDetails.orderType,
          createdAt: new Date(),
          completedAt: new Date(),
        };

        // Deduct ingredients from kitchen stock
        cart.forEach((cartItem) => {
          cartItem.menuItem.recipe.forEach((recipeItem) => {
            const quantityUsed = recipeItem.quantity * cartItem.quantity;
            get().deductKitchenStock(recipeItem.ingredientId, quantityUsed);
          });
        });

        set((state) => ({
          orders: [order, ...state.orders],
          cart: [],
        }));

        return order;
      },

      cancelOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status: 'cancelled' as const } : order
          ),
        }));
      },

      // Calculations
      calculateRecipeCost: (recipe) => {
        const { ingredients } = get();
        return recipe.reduce((total, item) => {
          const ingredient = ingredients.find((i) => i.id === item.ingredientId);
          if (!ingredient) return total;
          return total + ingredient.costPerUnit * item.quantity;
        }, 0);
      },

      getLowStockAlerts: () => {
        const { ingredients } = get();
        return ingredients
          .filter((ing) => {
            const totalStock = ing.storeStock + ing.kitchenStock;
            return totalStock <= ing.lowStockThreshold;
          })
          .map((ing) => ({
            ingredient: ing,
            currentTotal: ing.storeStock + ing.kitchenStock,
            threshold: ing.lowStockThreshold,
            severity: ing.storeStock + ing.kitchenStock <= ing.lowStockThreshold / 2
              ? ('critical' as const)
              : ('warning' as const),
          }));
      },

      getTodaysSales: () => {
        const { orders, menuItems } = get();
        const today = new Date().toDateString();
        const todaysOrders = orders.filter(
          (order) =>
            new Date(order.createdAt).toDateString() === today &&
            order.status === 'completed'
        );

        const revenue = todaysOrders.reduce((sum, order) => sum + order.total, 0);
        const cost = todaysOrders.reduce((sum, order) => {
          return (
            sum +
            order.items.reduce((itemSum, item) => {
              const menuItem = menuItems.find((m) => m.id === item.menuItemId);
              return itemSum + (menuItem?.recipeCost || 0) * item.quantity;
            }, 0)
          );
        }, 0);

        return {
          orders: todaysOrders.length,
          revenue,
          cost,
          profit: revenue - cost,
        };
      },
    }),
    {
      name: 'restaurant-storage',
    }
  )
);
