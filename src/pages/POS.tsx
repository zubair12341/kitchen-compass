import { useState } from 'react';
import { Search, Plus, Minus, X, CreditCard, Banknote, Smartphone, User, Hash } from 'lucide-react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function POS() {
  const {
    menuItems,
    menuCategories,
    cart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    completeOrder,
  } = useRestaurantStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [discount, setDiscount] = useState(0);

  // Filter menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory && item.isAvailable;
  });

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax - discount;

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setShowCheckout(true);
  };

  const handleCompleteOrder = () => {
    const order = completeOrder({
      paymentMethod,
      customerName: customerName || undefined,
      tableNumber: tableNumber || undefined,
      orderType,
      discount,
    });

    if (order) {
      toast.success(`Order ${order.orderNumber} completed!`, {
        description: `Total: $${order.total.toFixed(2)}`,
      });
      setShowCheckout(false);
      setCustomerName('');
      setTableNumber('');
      setDiscount(0);
    }
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-6 animate-fade-in">
      {/* Left Panel - Menu */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Search and Categories */}
        <div className="mb-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="shrink-0"
            >
              All
            </Button>
            {menuCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="shrink-0 gap-1"
              >
                <span>{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item) => {
              const cartItem = cart.find((c) => c.menuItem.id === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className={cn('pos-grid-item', cartItem && 'selected')}
                >
                  {cartItem && (
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {cartItem.quantity}
                    </span>
                  )}
                  <div className="text-2xl mb-2">
                    {menuCategories.find((c) => c.id === item.categoryId)?.icon || '🍽️'}
                  </div>
                  <h4 className="font-medium text-sm text-center line-clamp-2">{item.name}</h4>
                  <p className="text-sm font-bold text-primary mt-1">${item.price.toFixed(2)}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 flex flex-col rounded-xl border border-border bg-card overflow-hidden">
        {/* Cart Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Current Order</h2>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive">
                Clear
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{cart.length} items</p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium">No items in cart</p>
              <p className="text-sm text-muted-foreground">Select items from the menu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.menuItem.id} className="cart-item">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.menuItem.name}</h4>
                    <p className="text-sm text-muted-foreground">${item.menuItem.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateCartItemQuantity(item.menuItem.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateCartItemQuantity(item.menuItem.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeFromCart(item.menuItem.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        <div className="border-t border-border p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Order</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Order Type */}
            <div className="space-y-3">
              <Label>Order Type</Label>
              <RadioGroup
                value={orderType}
                onValueChange={(value: 'dine-in' | 'takeaway' | 'delivery') => setOrderType(value)}
                className="grid grid-cols-3 gap-2"
              >
                {['dine-in', 'takeaway', 'delivery'].map((type) => (
                  <Label
                    key={type}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all',
                      orderType === type ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    )}
                  >
                    <RadioGroupItem value={type} className="sr-only" />
                    <span className="text-sm font-medium capitalize">{type}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {/* Customer Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="customer"
                    placeholder="Optional"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {orderType === 'dine-in' && (
                <div className="space-y-2">
                  <Label htmlFor="table">Table Number</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="table"
                      placeholder="Optional"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <Label htmlFor="discount">Discount ($)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                value={discount || ''}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value: 'cash' | 'card' | 'mobile') => setPaymentMethod(value)}
                className="grid grid-cols-3 gap-2"
              >
                <Label
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all',
                    paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value="cash" className="sr-only" />
                  <Banknote className="h-6 w-6" />
                  <span className="text-sm font-medium">Cash</span>
                </Label>
                <Label
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all',
                    paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value="card" className="sr-only" />
                  <CreditCard className="h-6 w-6" />
                  <span className="text-sm font-medium">Card</span>
                </Label>
                <Label
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all',
                    paymentMethod === 'mobile' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value="mobile" className="sr-only" />
                  <Smartphone className="h-6 w-6" />
                  <span className="text-sm font-medium">Mobile</span>
                </Label>
              </RadioGroup>
            </div>

            {/* Order Summary */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-border pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteOrder}>
              Complete Order (${total.toFixed(2)})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
