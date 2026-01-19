import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Ingredient,
  MenuItem,
  MenuCategory,
  Order,
  OrderItem,
  Table,
  TableFloor,
  Waiter,
  RestaurantSettings,
  RecipeIngredient,
  DiscountType,
  CartItem,
} from '@/types/restaurant';

const generateOrderNumber = () => `ORD-${Date.now().toString(36).toUpperCase()}`;

export function useSupabaseActions() {
  // Ingredient actions
  const addIngredient = async (ingredient: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('ingredients')
      .insert({
        name: ingredient.name,
        unit: ingredient.unit,
        cost_per_unit: ingredient.costPerUnit,
        store_stock: ingredient.storeStock,
        kitchen_stock: ingredient.kitchenStock,
        low_stock_threshold: ingredient.lowStockThreshold,
        category: ingredient.category,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add ingredient');
      throw error;
    }
    toast.success('Ingredient added');
    return data;
  };

  const updateIngredient = async (id: string, updates: Partial<Ingredient>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
    if (updates.costPerUnit !== undefined) dbUpdates.cost_per_unit = updates.costPerUnit;
    if (updates.storeStock !== undefined) dbUpdates.store_stock = updates.storeStock;
    if (updates.kitchenStock !== undefined) dbUpdates.kitchen_stock = updates.kitchenStock;
    if (updates.lowStockThreshold !== undefined) dbUpdates.low_stock_threshold = updates.lowStockThreshold;
    if (updates.category !== undefined) dbUpdates.category = updates.category;

    const { error } = await supabase
      .from('ingredients')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update ingredient');
      throw error;
    }
    toast.success('Ingredient updated');
  };

  const deleteIngredient = async (id: string) => {
    const { error } = await supabase.from('ingredients').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete ingredient');
      throw error;
    }
    toast.success('Ingredient deleted');
  };

  // Menu Category actions
  const addMenuCategory = async (category: Omit<MenuCategory, 'id'>) => {
    const { data, error } = await supabase
      .from('menu_categories')
      .insert({
        name: category.name,
        icon: category.icon,
        color: category.color,
        sort_order: category.sortOrder,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add category');
      throw error;
    }
    toast.success('Category added');
    return data;
  };

  const updateMenuCategory = async (id: string, updates: Partial<MenuCategory>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

    const { error } = await supabase
      .from('menu_categories')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update category');
      throw error;
    }
    toast.success('Category updated');
  };

  const deleteMenuCategory = async (id: string) => {
    const { error } = await supabase.from('menu_categories').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete category');
      throw error;
    }
    toast.success('Category deleted');
  };

  // Ingredient Category actions
  const addIngredientCategory = async (category: { name: string; icon?: string; color?: string; sortOrder?: number }) => {
    const { data, error } = await supabase
      .from('ingredient_categories' as any)
      .insert({
        name: category.name,
        icon: category.icon || '📦',
        color: category.color || 'bg-gray-100',
        sort_order: category.sortOrder || 0,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add ingredient category');
      throw error;
    }
    toast.success('Ingredient category added');
    return data;
  };

  const deleteIngredientCategory = async (id: string) => {
    const { error } = await supabase.from('ingredient_categories' as any).delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete ingredient category');
      throw error;
    }
    toast.success('Ingredient category deleted');
  };

  // Menu Item actions
  const addMenuItem = async (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        name: item.name,
        description: item.description,
        price: item.price,
        category_id: item.categoryId || null,
        image: item.image,
        recipe: item.recipe as any,
        recipe_cost: item.recipeCost,
        profit_margin: item.profitMargin,
        is_available: item.isAvailable,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add menu item');
      throw error;
    }
    toast.success('Menu item added');
    return data;
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId || null;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.recipe !== undefined) dbUpdates.recipe = updates.recipe;
    if (updates.recipeCost !== undefined) dbUpdates.recipe_cost = updates.recipeCost;
    if (updates.profitMargin !== undefined) dbUpdates.profit_margin = updates.profitMargin;
    if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;

    const { error } = await supabase
      .from('menu_items')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update menu item');
      throw error;
    }
    toast.success('Menu item updated');
  };

  const deleteMenuItem = async (id: string) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete menu item');
      throw error;
    }
    toast.success('Menu item deleted');
  };

  // Table actions
  const addTable = async (table: Omit<Table, 'id' | 'status'>) => {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .insert({
        table_number: table.number,
        capacity: table.capacity,
        floor: table.floor,
        status: 'available',
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add table');
      throw error;
    }
    toast.success('Table added');
    return data;
  };

  const updateTable = async (id: string, updates: Partial<Table>) => {
    const dbUpdates: any = {};
    if (updates.number !== undefined) dbUpdates.table_number = updates.number;
    if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
    if (updates.floor !== undefined) dbUpdates.floor = updates.floor;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.currentOrderId !== undefined) dbUpdates.current_order_id = updates.currentOrderId;

    const { error } = await supabase
      .from('restaurant_tables')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update table');
      throw error;
    }
  };

  const deleteTable = async (id: string) => {
    const { error } = await supabase.from('restaurant_tables').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete table');
      throw error;
    }
    toast.success('Table deleted');
  };

  const occupyTable = async (tableId: string, orderId: string) => {
    await updateTable(tableId, { status: 'occupied', currentOrderId: orderId });
  };

  const freeTable = async (tableId: string) => {
    await updateTable(tableId, { status: 'available', currentOrderId: undefined });
  };

  // Waiter actions
  const addWaiter = async (waiter: Omit<Waiter, 'id'>) => {
    const { data, error } = await supabase
      .from('waiters')
      .insert({
        name: waiter.name,
        phone: waiter.phone,
        is_active: waiter.isActive,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add waiter');
      throw error;
    }
    toast.success('Waiter added');
    return data;
  };

  const updateWaiter = async (id: string, updates: Partial<Waiter>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { error } = await supabase
      .from('waiters')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update waiter');
      throw error;
    }
    toast.success('Waiter updated');
  };

  const deleteWaiter = async (id: string) => {
    const { error } = await supabase.from('waiters').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete waiter');
      throw error;
    }
    toast.success('Waiter deleted');
  };

  // Settings actions
  const updateSettings = async (updates: Partial<RestaurantSettings>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.taxRate !== undefined) dbUpdates.tax_rate = updates.taxRate;
    if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
    if (updates.currencySymbol !== undefined) dbUpdates.currency_symbol = updates.currencySymbol;
    if (updates.invoice?.title !== undefined) dbUpdates.invoice_title = updates.invoice.title;
    if (updates.invoice?.footer !== undefined) dbUpdates.invoice_footer = updates.invoice.footer;
    if (updates.invoice?.showLogo !== undefined) dbUpdates.invoice_show_logo = updates.invoice.showLogo;
    if (updates.invoice?.gstEnabled !== undefined) dbUpdates.invoice_gst_enabled = updates.invoice.gstEnabled;
    if (updates.invoice?.logoUrl !== undefined) dbUpdates.invoice_logo_url = updates.invoice.logoUrl;
    if (updates.security?.cancelOrderPassword !== undefined) dbUpdates.security_cancel_password = updates.security.cancelOrderPassword;
    if (updates.businessDay?.cutoffHour !== undefined) dbUpdates.business_day_cutoff_hour = updates.businessDay.cutoffHour;
    if (updates.businessDay?.cutoffMinute !== undefined) dbUpdates.business_day_cutoff_minute = updates.businessDay.cutoffMinute;

    // Get first settings row
    const { data: existingSettings } = await supabase
      .from('restaurant_settings')
      .select('id')
      .limit(1)
      .single();

    if (existingSettings) {
      const { error } = await supabase
        .from('restaurant_settings')
        .update(dbUpdates)
        .eq('id', existingSettings.id);

      if (error) {
        toast.error('Failed to update settings');
        throw error;
      }
    } else {
      const { error } = await supabase
        .from('restaurant_settings')
        .insert(dbUpdates);

      if (error) {
        toast.error('Failed to save settings');
        throw error;
      }
    }
    toast.success('Settings updated');
  };

  // Stock actions
  const addStoreStock = async (
    ingredientId: string,
    quantity: number,
    unitCost: number,
    currentIngredient: Ingredient
  ) => {
    // Calculate weighted average cost
    const currentTotalValue = currentIngredient.storeStock * currentIngredient.costPerUnit;
    const newPurchaseValue = quantity * unitCost;
    const newTotalStock = currentIngredient.storeStock + quantity;
    const newWeightedAvgCost = newTotalStock > 0
      ? (currentTotalValue + newPurchaseValue) / newTotalStock
      : unitCost;

    // Insert purchase record
    const { error: purchaseError } = await supabase
      .from('stock_purchases')
      .insert({
        ingredient_id: ingredientId,
        quantity,
        unit_cost: unitCost,
        total_cost: quantity * unitCost,
      });

    if (purchaseError) {
      toast.error('Failed to record purchase');
      throw purchaseError;
    }

    // Update ingredient stock and cost
    const { error: updateError } = await supabase
      .from('ingredients')
      .update({
        store_stock: newTotalStock,
        cost_per_unit: newWeightedAvgCost,
      })
      .eq('id', ingredientId);

    if (updateError) {
      toast.error('Failed to update stock');
      throw updateError;
    }

    // Insert transfer record
    await supabase.from('stock_transfers').insert({
      ingredient_id: ingredientId,
      quantity,
      from_location: 'store',
      to_location: 'store',
      reason: 'Stock received',
    });

    toast.success('Stock added');
  };

  const transferToKitchen = async (ingredientId: string, quantity: number, currentIngredient: Ingredient) => {
    if (currentIngredient.storeStock < quantity) {
      toast.error('Insufficient store stock');
      return;
    }

    const { error } = await supabase
      .from('ingredients')
      .update({
        store_stock: currentIngredient.storeStock - quantity,
        kitchen_stock: currentIngredient.kitchenStock + quantity,
      })
      .eq('id', ingredientId);

    if (error) {
      toast.error('Failed to transfer stock');
      throw error;
    }

    await supabase.from('stock_transfers').insert({
      ingredient_id: ingredientId,
      quantity,
      from_location: 'store',
      to_location: 'kitchen',
      reason: 'Transfer to kitchen',
    });

    toast.success('Stock transferred to kitchen');
  };

  const transferToStore = async (ingredientId: string, quantity: number, currentIngredient: Ingredient) => {
    if (currentIngredient.kitchenStock < quantity) {
      toast.error('Insufficient kitchen stock');
      return;
    }

    const { error } = await supabase
      .from('ingredients')
      .update({
        store_stock: currentIngredient.storeStock + quantity,
        kitchen_stock: currentIngredient.kitchenStock - quantity,
      })
      .eq('id', ingredientId);

    if (error) {
      toast.error('Failed to transfer stock');
      throw error;
    }

    await supabase.from('stock_transfers').insert({
      ingredient_id: ingredientId,
      quantity,
      from_location: 'kitchen',
      to_location: 'store',
      reason: 'Return to store',
    });

    toast.success('Stock transferred to store');
  };

  // Order actions
  const createOrder = async (
    cart: CartItem[],
    orderDetails: {
      paymentMethod: 'cash' | 'card' | 'mobile';
      customerName?: string;
      tableId?: string;
      waiterId?: string;
      orderType: 'dine-in' | 'online' | 'takeaway';
      discount?: number;
      discountType?: DiscountType;
      discountValue?: number;
    },
    settings: RestaurantSettings,
    tables: Table[],
    waiters: Waiter[],
    ingredients: Ingredient[]
  ) => {
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

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: generateOrderNumber(),
        order_type: orderDetails.orderType,
        status: 'pending',
        subtotal,
        tax,
        discount,
        discount_type: discountType,
        discount_value: discountValue,
        total,
        payment_method: orderDetails.paymentMethod,
        customer_name: orderDetails.customerName,
        table_id: orderDetails.tableId,
        table_number: table?.number,
        waiter_id: orderDetails.waiterId,
        waiter_name: waiter?.name,
      })
      .select()
      .single();

    if (orderError) {
      toast.error('Failed to create order');
      throw orderError;
    }

    // Create order items
    const orderItems = cart.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menuItem.id,
      menu_item_name: item.menuItem.name,
      quantity: item.quantity,
      unit_price: item.menuItem.price,
      total: item.menuItem.price * item.quantity,
      notes: item.notes,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Failed to create order items:', itemsError);
    }

    // Deduct kitchen stock
    for (const cartItem of cart) {
      for (const recipeItem of cartItem.menuItem.recipe) {
        const ingredient = ingredients.find((i) => i.id === recipeItem.ingredientId);
        if (ingredient) {
          const quantityUsed = recipeItem.quantity * cartItem.quantity;
          await supabase
            .from('ingredients')
            .update({
              kitchen_stock: Math.max(0, ingredient.kitchenStock - quantityUsed),
            })
            .eq('id', recipeItem.ingredientId);
        }
      }
    }

    // Occupy table if dine-in
    if (orderDetails.orderType === 'dine-in' && orderDetails.tableId) {
      await occupyTable(orderDetails.tableId, order.id);
    }

    toast.success(`Order ${order.order_number} created`);
    return order;
  };

  const updateOrder = async (
    orderId: string,
    cart: CartItem[],
    orderDetails: {
      paymentMethod: 'cash' | 'card' | 'mobile';
      customerName?: string;
      tableId?: string;
      waiterId?: string;
      orderType: 'dine-in' | 'online' | 'takeaway';
      discount?: number;
      discountType?: DiscountType;
      discountValue?: number;
    },
    settings: RestaurantSettings,
    tables: Table[],
    waiters: Waiter[]
  ) => {
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

    // Update order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update({
        subtotal,
        tax,
        discount,
        discount_type: discountType,
        discount_value: discountValue,
        total,
        payment_method: orderDetails.paymentMethod,
        customer_name: orderDetails.customerName,
        table_id: orderDetails.tableId,
        table_number: table?.number,
        waiter_id: orderDetails.waiterId,
        waiter_name: waiter?.name,
      })
      .eq('id', orderId)
      .select()
      .single();

    if (orderError) {
      toast.error('Failed to update order');
      throw orderError;
    }

    // Delete old items and insert new ones
    await supabase.from('order_items').delete().eq('order_id', orderId);

    const orderItems = cart.map((item) => ({
      order_id: orderId,
      menu_item_id: item.menuItem.id,
      menu_item_name: item.menuItem.name,
      quantity: item.quantity,
      unit_price: item.menuItem.price,
      total: item.menuItem.price * item.quantity,
      notes: item.notes,
    }));

    await supabase.from('order_items').insert(orderItems);

    toast.success('Order updated');
    return order;
  };

  const settleOrder = async (orderId: string, tableId?: string) => {
    if (tableId) {
      await freeTable(tableId);
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to settle order');
      throw error;
    }
    toast.success('Order settled');
  };

  const cancelOrder = async (orderId: string, tableId?: string, orderItems?: OrderItem[], menuItems?: MenuItem[], ingredients?: Ingredient[]) => {
    if (tableId) {
      await freeTable(tableId);
    }

    // Restore kitchen stock
    if (orderItems && menuItems && ingredients) {
      for (const orderItem of orderItems) {
        const menuItem = menuItems.find((m) => m.id === orderItem.menuItemId);
        if (menuItem) {
          for (const recipeItem of menuItem.recipe) {
            const ingredient = ingredients.find((i) => i.id === recipeItem.ingredientId);
            if (ingredient) {
              const quantityToRestore = recipeItem.quantity * orderItem.quantity;
              await supabase
                .from('ingredients')
                .update({
                  kitchen_stock: ingredient.kitchenStock + quantityToRestore,
                })
                .eq('id', recipeItem.ingredientId);
            }
          }
        }
      }
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to cancel order');
      throw error;
    }
    toast.success('Order cancelled');
  };

  return {
    // Ingredient actions
    addIngredient,
    updateIngredient,
    deleteIngredient,
    // Menu Category actions
    addMenuCategory,
    updateMenuCategory,
    deleteMenuCategory,
    // Ingredient Category actions
    addIngredientCategory,
    deleteIngredientCategory,
    // Menu Item actions
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    // Table actions
    addTable,
    updateTable,
    deleteTable,
    occupyTable,
    freeTable,
    // Waiter actions
    addWaiter,
    updateWaiter,
    deleteWaiter,
    // Settings actions
    updateSettings,
    // Stock actions
    addStoreStock,
    transferToKitchen,
    transferToStore,
    // Order actions
    createOrder,
    updateOrder,
    settleOrder,
    cancelOrder,
  };
}
