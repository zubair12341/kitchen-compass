import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Ingredient,
  MenuItem,
  MenuCategory,
  CartItem,
  Order,
  StockTransfer,
  StockDeduction,
  LowStockAlert,
  IngredientCategory,
  Table,
  TableFloor,
  Waiter,
  Staff,
  RestaurantSettings,
  InvoiceSettings,
  StockPurchase,
  DiscountType,
} from '@/types/restaurant';

interface RestaurantState {
  // Settings
  settings: RestaurantSettings;
  updateSettings: (settings: Partial<RestaurantSettings>) => void;
  updateInvoiceSettings: (invoice: Partial<InvoiceSettings>) => void;

  // Tables
  tables: Table[];
  addTable: (table: Omit<Table, 'id' | 'status'>) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  deleteTable: (id: string) => void;
  occupyTable: (tableId: string, orderId: string) => void;
  freeTable: (tableId: string) => void;
  getTablesByFloor: (floor: TableFloor) => Table[];

  // Waiters
  waiters: Waiter[];
  addWaiter: (waiter: Omit<Waiter, 'id'>) => void;
  updateWaiter: (id: string, updates: Partial<Waiter>) => void;
  deleteWaiter: (id: string) => void;

  // Staff
  staff: Staff[];
  addStaff: (staff: Omit<Staff, 'id' | 'createdAt'>) => void;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;

  // Ingredients
  ingredients: Ingredient[];
  ingredientCategories: IngredientCategory[];
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  addIngredientCategory: (category: Omit<IngredientCategory, 'id'>) => void;
  deleteIngredientCategory: (id: string) => void;

  // Stock Management
  stockPurchases: StockPurchase[];
  addStoreStock: (ingredientId: string, quantity: number, unitCost: number, reason?: string) => void;
  getStockPurchaseHistory: (ingredientId: string) => StockPurchase[];
  transferToKitchen: (ingredientId: string, quantity: number) => void;
  transferToStore: (ingredientId: string, quantity: number) => void;
  deductKitchenStock: (ingredientId: string, quantity: number, orderId?: string, orderNumber?: string) => void;
  stockTransfers: StockTransfer[];
  stockDeductions: StockDeduction[];
  getStockDeductionsByOrder: (orderId: string) => StockDeduction[];

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
  loadOrderToCart: (orderId: string) => { order: Order; waiterId?: string } | null;
  getOrderById: (orderId: string) => Order | undefined;
  // Orders
  orders: Order[];
  currentEditingOrderId: string | null;
  setCurrentEditingOrderId: (orderId: string | null) => void;
  completeOrder: (orderDetails: {
    paymentMethod: 'cash' | 'card' | 'mobile';
    customerName?: string;
    tableId?: string;
    waiterId?: string;
    orderType: 'dine-in' | 'online' | 'takeaway';
    discount?: number;
    discountType?: DiscountType;
    discountValue?: number;
  }) => Order | null;
  updateOrder: (orderId: string, orderDetails: {
    paymentMethod: 'cash' | 'card' | 'mobile';
    customerName?: string;
    tableId?: string;
    waiterId?: string;
    orderType: 'dine-in' | 'online' | 'takeaway';
    discount?: number;
    discountType?: DiscountType;
    discountValue?: number;
  }) => Order | null;
  settleOrder: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  getTableOrder: (tableId: string) => Order | undefined;

  // Calculations
  calculateRecipeCost: (recipe: { ingredientId: string; quantity: number }[]) => number;
  getLowStockAlerts: () => LowStockAlert[];
  getTodaysSales: () => { orders: number; revenue: number; cost: number; profit: number };
}

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateOrderNumber = () => `ORD-${Date.now().toString(36).toUpperCase()}`;

// Default Pakistan Settings
const defaultSettings: RestaurantSettings = {
  name: 'Pakistani Dhaba',
  address: 'Main Boulevard, Gulberg III, Lahore',
  phone: '+92 300 1234567',
  taxRate: 16, // GST in Pakistan
  currency: 'PKR',
  currencySymbol: 'Rs.',
  invoice: {
    title: 'Pakistani Dhaba',
    footer: 'Thank you for dining with us! Visit again.',
    showLogo: true,
    showTaxBreakdown: true,
    gstEnabled: true,
  },
  security: {
    cancelOrderPassword: '12345',
  },
};

// Sample Tables - categorized by floor
const initialTables: Table[] = [
  // Ground Floor Tables (1-4)
  { id: '1', number: 1, capacity: 4, floor: 'ground', status: 'available' },
  { id: '2', number: 2, capacity: 4, floor: 'ground', status: 'available' },
  { id: '3', number: 3, capacity: 2, floor: 'ground', status: 'available' },
  { id: '4', number: 4, capacity: 6, floor: 'ground', status: 'available' },
  // First Floor Tables (5-8)
  { id: '5', number: 5, capacity: 4, floor: 'first', status: 'available' },
  { id: '6', number: 6, capacity: 8, floor: 'first', status: 'available' },
  { id: '7', number: 7, capacity: 2, floor: 'first', status: 'available' },
  { id: '8', number: 8, capacity: 4, floor: 'first', status: 'available' },
  // Family Hall Tables (9-12)
  { id: '9', number: 9, capacity: 6, floor: 'family', status: 'available' },
  { id: '10', number: 10, capacity: 8, floor: 'family', status: 'available' },
  { id: '11', number: 11, capacity: 10, floor: 'family', status: 'available' },
  { id: '12', number: 12, capacity: 12, floor: 'family', status: 'available' },
];

// Sample Waiters
const initialWaiters: Waiter[] = [
  { id: '1', name: 'Ahmed Khan', phone: '+92 301 1111111', isActive: true },
  { id: '2', name: 'Bilal Hussain', phone: '+92 302 2222222', isActive: true },
  { id: '3', name: 'Usman Ali', phone: '+92 303 3333333', isActive: true },
  { id: '4', name: 'Farhan Malik', phone: '+92 304 4444444', isActive: true },
];

// Sample Staff
const initialStaff: Staff[] = [
  { id: '1', name: 'Muhammad Kashif', phone: '+92 300 1234567', email: 'admin@dhaba.pk', password: 'admin123', role: 'admin', isActive: true, createdAt: new Date() },
  { id: '2', name: 'Ali Raza', phone: '+92 301 7654321', email: 'manager@dhaba.pk', password: 'manager123', role: 'manager', isActive: true, createdAt: new Date() },
  { id: '3', name: 'Imran Shah', phone: '+92 302 1122334', email: 'pos@dhaba.pk', password: 'pos123', role: 'pos_user', isActive: true, createdAt: new Date() },
];

// Sample data - Pakistani Ingredients
const initialIngredientCategories: IngredientCategory[] = [
  { id: 'meat', name: 'Gosht (Meat)' },
  { id: 'poultry', name: 'Murgh (Poultry)' },
  { id: 'vegetables', name: 'Sabziyan (Vegetables)' },
  { id: 'dairy', name: 'Dairy' },
  { id: 'grains', name: 'Anaj (Grains)' },
  { id: 'spices', name: 'Masalay (Spices)' },
  { id: 'oils', name: 'Tel (Oils)' },
  { id: 'beverages', name: 'Mashroobat (Beverages)' },
];

const initialIngredients: Ingredient[] = [
  { id: '1', name: 'Chicken (Murgh)', unit: 'kg', costPerUnit: 450, storeStock: 25, kitchenStock: 5, lowStockThreshold: 10, category: 'poultry', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Mutton (Gosht)', unit: 'kg', costPerUnit: 1800, storeStock: 15, kitchenStock: 3, lowStockThreshold: 5, category: 'meat', createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'Beef (Gai ka Gosht)', unit: 'kg', costPerUnit: 850, storeStock: 20, kitchenStock: 4, lowStockThreshold: 8, category: 'meat', createdAt: new Date(), updatedAt: new Date() },
  { id: '4', name: 'Basmati Rice', unit: 'kg', costPerUnit: 280, storeStock: 50, kitchenStock: 10, lowStockThreshold: 15, category: 'grains', createdAt: new Date(), updatedAt: new Date() },
  { id: '5', name: 'Atta (Flour)', unit: 'kg', costPerUnit: 120, storeStock: 100, kitchenStock: 20, lowStockThreshold: 30, category: 'grains', createdAt: new Date(), updatedAt: new Date() },
  { id: '6', name: 'Onions (Pyaz)', unit: 'kg', costPerUnit: 80, storeStock: 30, kitchenStock: 10, lowStockThreshold: 15, category: 'vegetables', createdAt: new Date(), updatedAt: new Date() },
  { id: '7', name: 'Tomatoes (Tamatar)', unit: 'kg', costPerUnit: 120, storeStock: 25, kitchenStock: 8, lowStockThreshold: 10, category: 'vegetables', createdAt: new Date(), updatedAt: new Date() },
  { id: '8', name: 'Desi Ghee', unit: 'kg', costPerUnit: 2200, storeStock: 10, kitchenStock: 2, lowStockThreshold: 5, category: 'oils', createdAt: new Date(), updatedAt: new Date() },
  { id: '9', name: 'Cooking Oil', unit: 'L', costPerUnit: 400, storeStock: 20, kitchenStock: 5, lowStockThreshold: 8, category: 'oils', createdAt: new Date(), updatedAt: new Date() },
  { id: '10', name: 'Yogurt (Dahi)', unit: 'kg', costPerUnit: 250, storeStock: 15, kitchenStock: 3, lowStockThreshold: 5, category: 'dairy', createdAt: new Date(), updatedAt: new Date() },
  { id: '11', name: 'Garam Masala', unit: 'kg', costPerUnit: 1500, storeStock: 5, kitchenStock: 1, lowStockThreshold: 2, category: 'spices', createdAt: new Date(), updatedAt: new Date() },
  { id: '12', name: 'Red Chili Powder', unit: 'kg', costPerUnit: 800, storeStock: 8, kitchenStock: 2, lowStockThreshold: 3, category: 'spices', createdAt: new Date(), updatedAt: new Date() },
  { id: '13', name: 'Turmeric (Haldi)', unit: 'kg', costPerUnit: 600, storeStock: 5, kitchenStock: 1, lowStockThreshold: 2, category: 'spices', createdAt: new Date(), updatedAt: new Date() },
  { id: '14', name: 'Green Chilies', unit: 'kg', costPerUnit: 200, storeStock: 10, kitchenStock: 3, lowStockThreshold: 4, category: 'vegetables', createdAt: new Date(), updatedAt: new Date() },
  { id: '15', name: 'Ginger Garlic Paste', unit: 'kg', costPerUnit: 350, storeStock: 8, kitchenStock: 2, lowStockThreshold: 3, category: 'spices', createdAt: new Date(), updatedAt: new Date() },
];

const initialMenuCategories: MenuCategory[] = [
  { id: 'shinwari', name: 'Shinwari', icon: '🔥', color: '#dc2626', sortOrder: 1 },
  { id: 'bbq', name: 'BBQ & Tikka', icon: '🍢', color: '#ef4444', sortOrder: 2 },
  { id: 'karahi', name: 'Karahi', icon: '🍲', color: '#f97316', sortOrder: 3 },
  { id: 'biryani', name: 'Biryani & Rice', icon: '🍚', color: '#eab308', sortOrder: 4 },
  { id: 'handi', name: 'Handi', icon: '🥘', color: '#22c55e', sortOrder: 5 },
  { id: 'roti', name: 'Roti & Naan', icon: '🫓', color: '#a78bfa', sortOrder: 6 },
  { id: 'beverages', name: 'Beverages', icon: '🥤', color: '#3b82f6', sortOrder: 7 },
  { id: 'desserts', name: 'Meetha', icon: '🍮', color: '#ec4899', sortOrder: 8 },
];

const initialMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Chicken Tikka',
    description: 'Tender marinated chicken pieces grilled to perfection',
    price: 550,
    categoryId: 'bbq',
    recipe: [
      { ingredientId: '1', quantity: 0.25 },
      { ingredientId: '10', quantity: 0.05 },
      { ingredientId: '12', quantity: 0.01 },
      { ingredientId: '15', quantity: 0.02 },
    ],
    recipeCost: 145,
    profitMargin: 74,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Seekh Kabab',
    description: 'Spiced minced meat skewers',
    price: 450,
    categoryId: 'bbq',
    recipe: [
      { ingredientId: '3', quantity: 0.2 },
      { ingredientId: '6', quantity: 0.05 },
      { ingredientId: '11', quantity: 0.01 },
    ],
    recipeCost: 189,
    profitMargin: 58,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Chicken Karahi',
    description: 'Traditional wok-fried chicken with tomatoes and spices',
    price: 1200,
    categoryId: 'karahi',
    recipe: [
      { ingredientId: '1', quantity: 0.5 },
      { ingredientId: '7', quantity: 0.15 },
      { ingredientId: '14', quantity: 0.05 },
      { ingredientId: '9', quantity: 0.1 },
    ],
    recipeCost: 293,
    profitMargin: 76,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Mutton Karahi',
    description: 'Premium mutton cooked in traditional karahi style',
    price: 2200,
    categoryId: 'karahi',
    recipe: [
      { ingredientId: '2', quantity: 0.5 },
      { ingredientId: '7', quantity: 0.15 },
      { ingredientId: '8', quantity: 0.05 },
    ],
    recipeCost: 928,
    profitMargin: 58,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice with tender chicken pieces',
    price: 450,
    categoryId: 'biryani',
    recipe: [
      { ingredientId: '1', quantity: 0.2 },
      { ingredientId: '4', quantity: 0.15 },
      { ingredientId: '10', quantity: 0.05 },
      { ingredientId: '11', quantity: 0.01 },
    ],
    recipeCost: 157,
    profitMargin: 65,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    name: 'Mutton Biryani',
    description: 'Fragrant rice with succulent mutton pieces',
    price: 650,
    categoryId: 'biryani',
    recipe: [
      { ingredientId: '2', quantity: 0.2 },
      { ingredientId: '4', quantity: 0.15 },
      { ingredientId: '8', quantity: 0.03 },
    ],
    recipeCost: 468,
    profitMargin: 28,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    name: 'Beef Handi',
    description: 'Slow-cooked beef in traditional clay pot',
    price: 1400,
    categoryId: 'handi',
    recipe: [
      { ingredientId: '3', quantity: 0.4 },
      { ingredientId: '6', quantity: 0.1 },
      { ingredientId: '10', quantity: 0.1 },
      { ingredientId: '8', quantity: 0.05 },
    ],
    recipeCost: 483,
    profitMargin: 66,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '8',
    name: 'Plain Naan',
    description: 'Freshly baked traditional naan bread',
    price: 50,
    categoryId: 'roti',
    recipe: [
      { ingredientId: '5', quantity: 0.1 },
    ],
    recipeCost: 12,
    profitMargin: 76,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '9',
    name: 'Roghni Naan',
    description: 'Buttery naan topped with sesame seeds',
    price: 80,
    categoryId: 'roti',
    recipe: [
      { ingredientId: '5', quantity: 0.1 },
      { ingredientId: '8', quantity: 0.02 },
    ],
    recipeCost: 56,
    profitMargin: 30,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '10',
    name: 'Lassi',
    description: 'Traditional sweet yogurt drink',
    price: 150,
    categoryId: 'beverages',
    recipe: [
      { ingredientId: '10', quantity: 0.15 },
    ],
    recipeCost: 38,
    profitMargin: 75,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Shinwari Dishes
  {
    id: '11',
    name: 'Shinwari Karahi (Mutton)',
    description: 'Authentic Peshawari style dry mutton karahi with tomatoes and green chilies',
    price: 2500,
    categoryId: 'shinwari',
    recipe: [
      { ingredientId: '2', quantity: 0.5 },
      { ingredientId: '7', quantity: 0.1 },
      { ingredientId: '14', quantity: 0.05 },
      { ingredientId: '8', quantity: 0.08 },
    ],
    recipeCost: 1094,
    profitMargin: 56,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '12',
    name: 'Shinwari Karahi (Chicken)',
    description: 'Traditional Peshawari style chicken with aromatic spices',
    price: 1400,
    categoryId: 'shinwari',
    recipe: [
      { ingredientId: '1', quantity: 0.5 },
      { ingredientId: '7', quantity: 0.1 },
      { ingredientId: '14', quantity: 0.05 },
      { ingredientId: '8', quantity: 0.05 },
    ],
    recipeCost: 357,
    profitMargin: 75,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '13',
    name: 'Shinwari Tikka',
    description: 'Juicy meat pieces marinated in Peshawari spices and grilled',
    price: 750,
    categoryId: 'shinwari',
    recipe: [
      { ingredientId: '2', quantity: 0.25 },
      { ingredientId: '15', quantity: 0.02 },
      { ingredientId: '12', quantity: 0.01 },
    ],
    recipeCost: 465,
    profitMargin: 38,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '14',
    name: 'Namkeen Gosht',
    description: 'Salt-grilled mutton, Shinwari specialty with minimal spices',
    price: 2200,
    categoryId: 'shinwari',
    recipe: [
      { ingredientId: '2', quantity: 0.5 },
      { ingredientId: '8', quantity: 0.06 },
    ],
    recipeCost: 1032,
    profitMargin: 53,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '15',
    name: 'Dumba Karahi',
    description: 'Premium lamb karahi cooked in traditional Shinwari style',
    price: 2800,
    categoryId: 'shinwari',
    recipe: [
      { ingredientId: '2', quantity: 0.6 },
      { ingredientId: '7', quantity: 0.1 },
      { ingredientId: '8', quantity: 0.1 },
    ],
    recipeCost: 1312,
    profitMargin: 53,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '16',
    name: 'Charsi Tikka',
    description: 'Famous Peshawari mutton tikka with signature spicy marinade',
    price: 850,
    categoryId: 'shinwari',
    recipe: [
      { ingredientId: '2', quantity: 0.25 },
      { ingredientId: '11', quantity: 0.02 },
      { ingredientId: '12', quantity: 0.02 },
    ],
    recipeCost: 496,
    profitMargin: 42,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '17',
    name: 'Chapli Kabab',
    description: 'Authentic Peshawari minced meat patties with tomatoes and spices',
    price: 500,
    categoryId: 'shinwari',
    recipe: [
      { ingredientId: '3', quantity: 0.25 },
      { ingredientId: '7', quantity: 0.05 },
      { ingredientId: '6', quantity: 0.03 },
    ],
    recipeCost: 230,
    profitMargin: 54,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '18',
    name: 'Tawa Piece',
    description: 'Bone-in chicken pieces cooked on flat iron griddle Shinwari style',
    price: 650,
    categoryId: 'shinwari',
    recipe: [
      { ingredientId: '1', quantity: 0.35 },
      { ingredientId: '14', quantity: 0.03 },
      { ingredientId: '9', quantity: 0.08 },
    ],
    recipeCost: 196,
    profitMargin: 70,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set, get) => ({
      // Initial Data
      settings: defaultSettings,
      tables: initialTables,
      waiters: initialWaiters,
      staff: initialStaff,
      ingredients: initialIngredients,
      ingredientCategories: initialIngredientCategories,
      menuItems: initialMenuItems,
      menuCategories: initialMenuCategories,
      cart: [],
      orders: [],
      stockTransfers: [],
      stockDeductions: [],
      stockPurchases: [],
      currentEditingOrderId: null,

      // Settings
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      updateInvoiceSettings: (invoice) => {
        set((state) => ({
          settings: {
            ...state.settings,
            invoice: { ...state.settings.invoice, ...invoice },
          },
        }));
      },

      // Table Management
      addTable: (table) => {
        const newTable: Table = {
          ...table,
          id: generateId(),
          status: 'available',
        };
        set((state) => ({
          tables: [...state.tables, newTable],
        }));
      },

      updateTable: (id, updates) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === id ? { ...table, ...updates } : table
          ),
        }));
      },

      deleteTable: (id) => {
        set((state) => ({
          tables: state.tables.filter((table) => table.id !== id),
        }));
      },

      occupyTable: (tableId, orderId) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId
              ? { ...table, status: 'occupied' as const, currentOrderId: orderId }
              : table
          ),
        }));
      },

      freeTable: (tableId) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId
              ? { ...table, status: 'available' as const, currentOrderId: undefined }
              : table
          ),
        }));
      },

      getTablesByFloor: (floor) => {
        return get().tables.filter((t) => t.floor === floor);
      },

      // Waiter Management
      addWaiter: (waiter) => {
        const newWaiter: Waiter = {
          ...waiter,
          id: generateId(),
        };
        set((state) => ({
          waiters: [...state.waiters, newWaiter],
        }));
      },

      updateWaiter: (id, updates) => {
        set((state) => ({
          waiters: state.waiters.map((waiter) =>
            waiter.id === id ? { ...waiter, ...updates } : waiter
          ),
        }));
      },

      deleteWaiter: (id) => {
        set((state) => ({
          waiters: state.waiters.filter((waiter) => waiter.id !== id),
        }));
      },

      // Staff Management
      addStaff: (staffMember) => {
        const newStaff: Staff = {
          ...staffMember,
          id: generateId(),
          createdAt: new Date(),
        };
        set((state) => ({
          staff: [...state.staff, newStaff],
        }));
      },

      updateStaff: (id, updates) => {
        set((state) => ({
          staff: state.staff.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteStaff: (id) => {
        set((state) => ({
          staff: state.staff.filter((s) => s.id !== id),
        }));
      },

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

      addIngredientCategory: (category) => {
        const newCategory: IngredientCategory = {
          ...category,
          id: generateId(),
        };
        set((state) => ({
          ingredientCategories: [...state.ingredientCategories, newCategory],
        }));
      },

      deleteIngredientCategory: (id) => {
        set((state) => ({
          ingredientCategories: state.ingredientCategories.filter((cat) => cat.id !== id),
        }));
      },

      // Stock Management
      addStoreStock: (ingredientId, quantity, unitCost, reason = 'Stock received') => {
        const ingredient = get().ingredients.find((i) => i.id === ingredientId);
        if (!ingredient) return;

        // Calculate weighted average cost
        const currentTotalValue = ingredient.storeStock * ingredient.costPerUnit;
        const newPurchaseValue = quantity * unitCost;
        const newTotalStock = ingredient.storeStock + quantity;
        const newWeightedAvgCost = newTotalStock > 0 
          ? (currentTotalValue + newPurchaseValue) / newTotalStock 
          : unitCost;

        const purchaseId = generateId();

        set((state) => ({
          ingredients: state.ingredients.map((ing) =>
            ing.id === ingredientId
              ? { 
                  ...ing, 
                  storeStock: ing.storeStock + quantity, 
                  costPerUnit: newWeightedAvgCost,
                  updatedAt: new Date() 
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
              toLocation: 'store' as const,
              reason,
              createdAt: new Date(),
            },
          ],
          stockPurchases: [
            ...state.stockPurchases,
            {
              id: purchaseId,
              ingredientId,
              quantity,
              unitCost,
              totalCost: quantity * unitCost,
              purchaseDate: new Date(),
              createdAt: new Date(),
            },
          ],
        }));
      },

      getStockPurchaseHistory: (ingredientId) => {
        return get().stockPurchases
          .filter((p) => p.ingredientId === ingredientId)
          .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
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

      transferToStore: (ingredientId, quantity) => {
        set((state) => {
          const ingredient = state.ingredients.find((i) => i.id === ingredientId);
          if (!ingredient || ingredient.kitchenStock < quantity) return state;

          return {
            ingredients: state.ingredients.map((ing) =>
              ing.id === ingredientId
                ? {
                    ...ing,
                    storeStock: ing.storeStock + quantity,
                    kitchenStock: ing.kitchenStock - quantity,
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
                fromLocation: 'kitchen' as const,
                toLocation: 'store' as const,
                reason: 'Return to store',
                createdAt: new Date(),
              },
            ],
          };
        });
      },

      deductKitchenStock: (ingredientId, quantity, orderId, orderNumber) => {
        const ingredient = get().ingredients.find((i) => i.id === ingredientId);
        set((state) => ({
          ingredients: state.ingredients.map((ing) =>
            ing.id === ingredientId
              ? { ...ing, kitchenStock: Math.max(0, ing.kitchenStock - quantity), updatedAt: new Date() }
              : ing
          ),
          stockDeductions: orderId && orderNumber ? [
            ...state.stockDeductions,
            {
              id: generateId(),
              orderId,
              orderNumber,
              ingredientId,
              ingredientName: ingredient?.name || 'Unknown',
              quantity,
              createdAt: new Date(),
            },
          ] : state.stockDeductions,
        }));
      },

      getStockDeductionsByOrder: (orderId) => {
        return get().stockDeductions.filter((d) => d.orderId === orderId);
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

      clearCart: () => set({ cart: [], currentEditingOrderId: null }),

      addCartItemNote: (menuItemId, note) => {
        set((state) => ({
          cart: state.cart.map((item) =>
            item.menuItem.id === menuItemId ? { ...item, notes: note } : item
          ),
        }));
      },

      loadOrderToCart: (orderId) => {
        const { orders, menuItems } = get();
        const order = orders.find((o) => o.id === orderId);
        if (!order) return null;

        const cartItems: CartItem[] = [];
        order.items.forEach((item) => {
          const menuItem = menuItems.find((m) => m.id === item.menuItemId);
          if (menuItem) {
            cartItems.push({
              menuItem,
              quantity: item.quantity,
              notes: item.notes,
            });
          }
        });

        set({
          cart: cartItems,
          currentEditingOrderId: orderId,
        });

        return { order, waiterId: order.waiterId };
      },

      getOrderById: (orderId) => {
        return get().orders.find((o) => o.id === orderId);
      },

      setCurrentEditingOrderId: (orderId) => {
        set({ currentEditingOrderId: orderId });
      },

      getTableOrder: (tableId) => {
        const { orders, tables } = get();
        const table = tables.find((t) => t.id === tableId);
        if (!table || !table.currentOrderId) return undefined;
        return orders.find((o) => o.id === table.currentOrderId && o.status === 'pending');
      },

      // Order Management
      completeOrder: (orderDetails) => {
        const { cart, settings, tables, waiters } = get();
        if (cart.length === 0) return null;

        const subtotal = cart.reduce(
          (sum, item) => sum + item.menuItem.price * item.quantity,
          0
        );
        const gstEnabled = settings.invoice?.gstEnabled ?? true;
        const tax = gstEnabled ? subtotal * (settings.taxRate / 100) : 0;
        const discountType = orderDetails.discountType || 'fixed';
        const discountValue = orderDetails.discountValue || 0;
        const discount = discountType === 'percentage' 
          ? (subtotal * discountValue) / 100 
          : discountValue;
        const total = subtotal + tax - discount;

        const table = tables.find((t) => t.id === orderDetails.tableId);
        const waiter = waiters.find((w) => w.id === orderDetails.waiterId);

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
          discountType,
          discountValue,
          total,
          paymentMethod: orderDetails.paymentMethod,
          status: orderDetails.orderType === 'dine-in' ? 'pending' : 'completed',
          customerName: orderDetails.customerName,
          tableId: orderDetails.tableId,
          tableNumber: table?.number,
          waiterId: orderDetails.waiterId,
          waiterName: waiter?.name,
          orderType: orderDetails.orderType,
          createdAt: new Date(),
          completedAt: orderDetails.orderType !== 'dine-in' ? new Date() : undefined,
        };

        // Deduct ingredients from kitchen stock with order tracking
        const orderNumber = order.orderNumber;
        const orderId = order.id;
        cart.forEach((cartItem) => {
          cartItem.menuItem.recipe.forEach((recipeItem) => {
            const quantityUsed = recipeItem.quantity * cartItem.quantity;
            get().deductKitchenStock(recipeItem.ingredientId, quantityUsed, orderId, orderNumber);
          });
        });

        // Occupy table if dine-in
        if (orderDetails.orderType === 'dine-in' && orderDetails.tableId) {
          get().occupyTable(orderDetails.tableId, order.id);
        }

        set((state) => ({
          orders: [order, ...state.orders],
          cart: [],
          currentEditingOrderId: null,
        }));

        return order;
      },

      updateOrder: (orderId, orderDetails) => {
        const { cart, settings, tables, waiters } = get();
        if (cart.length === 0) return null;

        const subtotal = cart.reduce(
          (sum, item) => sum + item.menuItem.price * item.quantity,
          0
        );
        const gstEnabled = settings.invoice?.gstEnabled ?? true;
        const tax = gstEnabled ? subtotal * (settings.taxRate / 100) : 0;
        const discountType = orderDetails.discountType || 'fixed';
        const discountValue = orderDetails.discountValue || 0;
        const discount = discountType === 'percentage' 
          ? (subtotal * discountValue) / 100 
          : discountValue;
        const total = subtotal + tax - discount;

        const table = tables.find((t) => t.id === orderDetails.tableId);
        const waiter = waiters.find((w) => w.id === orderDetails.waiterId);

        let updatedOrder: Order | null = null;

        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id === orderId) {
              updatedOrder = {
                ...order,
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
                discountType,
                discountValue,
                total,
                paymentMethod: orderDetails.paymentMethod,
                customerName: orderDetails.customerName,
                tableId: orderDetails.tableId,
                tableNumber: table?.number,
                waiterId: orderDetails.waiterId,
                waiterName: waiter?.name,
              };
              return updatedOrder;
            }
            return order;
          }),
          cart: [],
          currentEditingOrderId: null,
        }));

        return get().orders.find((o) => o.id === orderId) || null;
      },

      settleOrder: (orderId) => {
        const { orders } = get();
        const order = orders.find((o) => o.id === orderId);
        
        if (order?.tableId) {
          get().freeTable(order.tableId);
        }

        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'completed' as const, completedAt: new Date() } : o
          ),
        }));
      },

      cancelOrder: (orderId) => {
        const { orders } = get();
        const order = orders.find((o) => o.id === orderId);
        
        if (order?.tableId) {
          get().freeTable(order.tableId);
        }

        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'cancelled' as const } : o
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
