import { useState } from 'react';
import { Package, ArrowRight, Plus, AlertTriangle, Warehouse, ChefHat } from 'lucide-react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function Stock() {
  const { ingredients, ingredientCategories, addStoreStock, transferToKitchen, getLowStockAlerts } = useRestaurantStore();
  const [showAddStockDialog, setShowAddStockDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [quantity, setQuantity] = useState('');

  const lowStockAlerts = getLowStockAlerts();

  const handleAddStock = () => {
    if (!selectedIngredient || !quantity) {
      toast.error('Please select ingredient and enter quantity');
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    addStoreStock(selectedIngredient, qty, 'Stock received');
    toast.success('Stock added successfully');
    setShowAddStockDialog(false);
    setSelectedIngredient('');
    setQuantity('');
  };

  const handleTransfer = () => {
    if (!selectedIngredient || !quantity) {
      toast.error('Please select ingredient and enter quantity');
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const ing = ingredients.find((i) => i.id === selectedIngredient);
    if (ing && qty > ing.storeStock) {
      toast.error(`Insufficient stock. Available: ${ing.storeStock} ${ing.unit}`);
      return;
    }

    transferToKitchen(selectedIngredient, qty);
    toast.success('Stock transferred to kitchen');
    setShowTransferDialog(false);
    setSelectedIngredient('');
    setQuantity('');
  };

  const totalStoreValue = ingredients.reduce((sum, ing) => sum + ing.storeStock * ing.costPerUnit, 0);
  const totalKitchenValue = ingredients.reduce((sum, ing) => sum + ing.kitchenStock * ing.costPerUnit, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Stock Management</h1>
          <p className="page-subtitle">Manage store and kitchen inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTransferDialog(true)} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            Transfer to Kitchen
          </Button>
          <Button onClick={() => setShowAddStockDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="stat-card">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Warehouse className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Store Value</p>
              <p className="text-2xl font-bold">${totalStoreValue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-success/10 p-3 text-success">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kitchen Value</p>
              <p className="text-2xl font-bold">${totalKitchenValue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-accent/10 p-3 text-accent">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{ingredients.length}</p>
            </div>
          </div>
        </Card>
        <Card className={`stat-card ${lowStockAlerts.length > 0 ? 'border-destructive/50' : ''}`}>
          <div className="flex items-center gap-4">
            <div className={`rounded-xl p-3 ${lowStockAlerts.length > 0 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
              <p className="text-2xl font-bold">{lowStockAlerts.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {lowStockAlerts.map((alert) => (
                <div
                  key={alert.ingredient.id}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    alert.severity === 'critical' ? 'border-destructive bg-destructive/10' : 'border-warning bg-warning/10'
                  }`}
                >
                  <div>
                    <p className="font-medium">{alert.ingredient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.currentTotal.toFixed(2)} / {alert.threshold} {alert.ingredient.unit}
                    </p>
                  </div>
                  <span className={alert.severity === 'critical' ? 'badge-destructive' : 'badge-warning'}>
                    {alert.severity}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Tables */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Stock</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="kitchen">Kitchen</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="section-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Store Stock</th>
                  <th>Kitchen Stock</th>
                  <th>Total</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ing) => {
                  const category = ingredientCategories.find((c) => c.id === ing.category);
                  const totalStock = ing.storeStock + ing.kitchenStock;
                  const isLow = totalStock <= ing.lowStockThreshold;
                  const totalValue = totalStock * ing.costPerUnit;

                  return (
                    <tr key={ing.id} className={isLow ? 'bg-destructive/5' : ''}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium">{ing.name}</span>
                        </div>
                      </td>
                      <td className="text-muted-foreground">{category?.name || '-'}</td>
                      <td>{ing.unit}</td>
                      <td>{ing.storeStock.toFixed(2)}</td>
                      <td>{ing.kitchenStock.toFixed(2)}</td>
                      <td className="font-medium">{totalStock.toFixed(2)}</td>
                      <td className="font-medium">${totalValue.toFixed(2)}</td>
                      <td>
                        <span className={isLow ? 'badge-destructive' : 'badge-success'}>
                          {isLow ? 'Low' : 'OK'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="store">
          <div className="section-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Store Stock</th>
                  <th>Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.filter((ing) => ing.storeStock > 0).map((ing) => {
                  const category = ingredientCategories.find((c) => c.id === ing.category);
                  return (
                    <tr key={ing.id}>
                      <td className="font-medium">{ing.name}</td>
                      <td className="text-muted-foreground">{category?.name || '-'}</td>
                      <td>{ing.unit}</td>
                      <td>{ing.storeStock.toFixed(2)}</td>
                      <td className="font-medium">${(ing.storeStock * ing.costPerUnit).toFixed(2)}</td>
                      <td>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedIngredient(ing.id);
                            setShowTransferDialog(true);
                          }}
                        >
                          Transfer
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="kitchen">
          <div className="section-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Kitchen Stock</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.filter((ing) => ing.kitchenStock > 0).map((ing) => {
                  const category = ingredientCategories.find((c) => c.id === ing.category);
                  return (
                    <tr key={ing.id}>
                      <td className="font-medium">{ing.name}</td>
                      <td className="text-muted-foreground">{category?.name || '-'}</td>
                      <td>{ing.unit}</td>
                      <td>{ing.kitchenStock.toFixed(2)}</td>
                      <td className="font-medium">${(ing.kitchenStock * ing.costPerUnit).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Stock Dialog */}
      <Dialog open={showAddStockDialog} onOpenChange={setShowAddStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock to Store</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ingredient</Label>
              <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ingredient" />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map((ing) => (
                    <SelectItem key={ing.id} value={ing.id}>
                      {ing.name} ({ing.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStockDialog(false)}>Cancel</Button>
            <Button onClick={handleAddStock}>Add Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer to Kitchen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ingredient</Label>
              <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ingredient" />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.filter((ing) => ing.storeStock > 0).map((ing) => (
                    <SelectItem key={ing.id} value={ing.id}>
                      {ing.name} - Available: {ing.storeStock} {ing.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer-qty">Quantity to Transfer</Label>
              <Input
                id="transfer-qty"
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransferDialog(false)}>Cancel</Button>
            <Button onClick={handleTransfer}>Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
