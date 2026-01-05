export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
  storeStock: number;
  kitchenStock: number;
  lowStockThreshold: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image?: string;
  recipe: RecipeIngredient[];
  recipeCost: number;
  profitMargin: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied';
  currentOrderId?: string;
}

export interface Waiter {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  customerName?: string;
  tableId?: string;
  tableNumber?: number;
  waiterId?: string;
  waiterName?: string;
  orderType: 'dine-in' | 'online' | 'takeaway';
  createdAt: Date;
  completedAt?: Date;
}

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface StockTransfer {
  id: string;
  ingredientId: string;
  quantity: number;
  fromLocation: 'store' | 'kitchen';
  toLocation: 'store' | 'kitchen';
  reason: string;
  createdAt: Date;
}

export interface StockAdjustment {
  id: string;
  ingredientId: string;
  quantity: number;
  type: 'add' | 'remove' | 'transfer';
  location: 'store' | 'kitchen';
  reason: string;
  createdAt: Date;
}

export interface LowStockAlert {
  ingredient: Ingredient;
  currentTotal: number;
  threshold: number;
  severity: 'warning' | 'critical';
}

export interface DailySales {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
}

export interface IngredientCategory {
  id: string;
  name: string;
}

export interface RestaurantSettings {
  name: string;
  address: string;
  phone: string;
  taxRate: number;
  currency: string;
  currencySymbol: string;
}
