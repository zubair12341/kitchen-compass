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

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile';
  status: 'completed' | 'cancelled' | 'refunded';
  customerName?: string;
  tableNumber?: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
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
