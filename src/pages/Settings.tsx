import { useState } from 'react';
import { Save, Building, Bell, Plus, Trash2, FileText, Receipt, Lock, Eye, EyeOff } from 'lucide-react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { SecuritySettings } from '@/types/restaurant';

export default function RestaurantSettings() {
  const {
    settings,
    menuCategories,
    ingredientCategories,
    updateSettings,
    updateInvoiceSettings,
    addMenuCategory,
    deleteMenuCategory,
    addIngredientCategory,
    deleteIngredientCategory,
  } = useRestaurantStore();
  
  // General Settings
  const [restaurantName, setRestaurantName] = useState(settings.name);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [taxRate, setTaxRate] = useState(settings.taxRate.toString());
  
  // Invoice Settings
  const [invoiceTitle, setInvoiceTitle] = useState(settings.invoice?.title || settings.name);
  const [invoiceFooter, setInvoiceFooter] = useState(settings.invoice?.footer || 'Thank you for dining with us!');
  const [showLogo, setShowLogo] = useState(settings.invoice?.showLogo ?? true);
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(settings.invoice?.showTaxBreakdown ?? true);
  const [gstEnabled, setGstEnabled] = useState(settings.invoice?.gstEnabled ?? true);

  // Security Settings
  const [cancelPassword, setCancelPassword] = useState(settings.security?.cancelOrderPassword || '12345');
  const [showPassword, setShowPassword] = useState(false);

  // Notifications
  const [lowStockAlert, setLowStockAlert] = useState(true);
  
  // Categories
  const [newMenuCategoryName, setNewMenuCategoryName] = useState('');
  const [newMenuCategoryIcon, setNewMenuCategoryIcon] = useState('🍽️');
  const [newIngredientCategoryName, setNewIngredientCategoryName] = useState('');

  const handleSaveGeneralSettings = () => {
    updateSettings({
      name: restaurantName,
      address,
      phone,
      taxRate: parseFloat(taxRate) || 16,
    });
    toast.success('General settings saved');
  };

  const handleSaveInvoiceSettings = () => {
    updateInvoiceSettings({
      title: invoiceTitle,
      footer: invoiceFooter,
      showLogo,
      showTaxBreakdown,
      gstEnabled,
    });
    toast.success('Invoice settings saved');
  };

  const handleSaveSecuritySettings = () => {
    if (cancelPassword.length !== 5 || !/^\d+$/.test(cancelPassword)) {
      toast.error('Password must be exactly 5 digits');
      return;
    }
    updateSettings({
      security: {
        cancelOrderPassword: cancelPassword,
      },
    });
    toast.success('Security settings saved');
  };

  const handleAddMenuCategory = () => {
    if (!newMenuCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    addMenuCategory({
      name: newMenuCategoryName,
      icon: newMenuCategoryIcon,
      color: '#f97316',
      sortOrder: menuCategories.length + 1,
    });
    setNewMenuCategoryName('');
    setNewMenuCategoryIcon('🍽️');
    toast.success('Menu category added');
  };

  const handleAddIngredientCategory = () => {
    if (!newIngredientCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    addIngredientCategory({ name: newIngredientCategoryName });
    setNewIngredientCategoryName('');
    toast.success('Ingredient category added');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your restaurant settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card className="section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Restaurant Information
              </CardTitle>
              <CardDescription>Basic restaurant details and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="Pakistani Dhaba"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Main Boulevard, Gulberg III, Lahore"
                  rows={2}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax">Tax Rate (GST %)</Label>
                  <Input
                    id="tax"
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    placeholder="16"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <p><strong>Currency:</strong> PKR (Pakistani Rupee)</p>
                <p><strong>Symbol:</strong> Rs.</p>
              </div>
              <Separator />
              <Button onClick={handleSaveGeneralSettings} className="gap-2">
                <Save className="h-4 w-4" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Settings Tab */}
        <TabsContent value="invoice">
          <Card className="section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Invoice Customization
              </CardTitle>
              <CardDescription>Customize invoice appearance and content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-title">Invoice Title</Label>
                <Input
                  id="invoice-title"
                  value={invoiceTitle}
                  onChange={(e) => setInvoiceTitle(e.target.value)}
                  placeholder="Pakistani Dhaba"
                />
                <p className="text-xs text-muted-foreground">This will appear at the top of the invoice</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-footer">Invoice Footer</Label>
                <Textarea
                  id="invoice-footer"
                  value={invoiceFooter}
                  onChange={(e) => setInvoiceFooter(e.target.value)}
                  placeholder="Thank you for dining with us! Visit again."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">This will appear at the bottom of the invoice</p>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Logo</p>
                    <p className="text-sm text-muted-foreground">Display restaurant logo on invoice</p>
                  </div>
                  <Switch checked={showLogo} onCheckedChange={setShowLogo} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Tax Breakdown</p>
                    <p className="text-sm text-muted-foreground">Show GST details separately on invoice</p>
                  </div>
                  <Switch checked={showTaxBreakdown} onCheckedChange={setShowTaxBreakdown} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable GST</p>
                    <p className="text-sm text-muted-foreground">Apply GST tax to all orders</p>
                  </div>
                  <Switch checked={gstEnabled} onCheckedChange={setGstEnabled} />
                </div>
              </div>
              <Separator />

              {/* Invoice Preview */}
              <div className="space-y-2">
                <Label>Invoice Preview</Label>
                <div className="rounded-lg border bg-white p-4 text-center max-w-sm mx-auto">
                  <h3 className="text-lg font-bold">{invoiceTitle || 'Restaurant Name'}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{address}</p>
                  <div className="border-t border-b py-2 my-2 text-left text-sm">
                    <div className="flex justify-between">
                      <span>Item 1</span>
                      <span>Rs. 450</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Item 2</span>
                      <span>Rs. 550</span>
                    </div>
                  </div>
                  {showTaxBreakdown && gstEnabled && (
                    <div className="text-left text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>Rs. 1,000</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>GST ({taxRate}%)</span>
                        <span>Rs. {(1000 * (parseFloat(taxRate) || 16) / 100).toFixed(0)}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                    <span>Total</span>
                    <span>Rs. {gstEnabled ? (1000 * (1 + (parseFloat(taxRate) || 16) / 100)).toFixed(0) : '1,000'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 italic">{invoiceFooter}</p>
                </div>
              </div>

              <Button onClick={handleSaveInvoiceSettings} className="gap-2">
                <Save className="h-4 w-4" />
                Save Invoice Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security">
          <Card className="section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cancel-password">Order Cancellation Password (5 digits)</Label>
                <div className="relative">
                  <Input
                    id="cancel-password"
                    type={showPassword ? 'text' : 'password'}
                    maxLength={5}
                    value={cancelPassword}
                    onChange={(e) => setCancelPassword(e.target.value.replace(/\D/g, ''))}
                    placeholder="12345"
                    className="pr-10 text-lg tracking-widest"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This password is required to cancel any order from the Orders section. Only share with authorized staff.
                </p>
              </div>
              <div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
                <p className="text-sm text-warning font-medium">⚠️ Important</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Any user with access to the POS or Orders section can cancel orders using this password. Keep it secure and change it regularly.
                </p>
              </div>
              <Separator />
              <Button onClick={handleSaveSecuritySettings} className="gap-2">
                <Save className="h-4 w-4" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Menu Categories */}
            <Card className="section-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Menu Categories
                </CardTitle>
                <CardDescription>Categories for food items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Category name"
                    value={newMenuCategoryName}
                    onChange={(e) => setNewMenuCategoryName(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Icon"
                    value={newMenuCategoryIcon}
                    onChange={(e) => setNewMenuCategoryIcon(e.target.value)}
                    className="w-16 text-center"
                  />
                  <Button onClick={handleAddMenuCategory}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {menuCategories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{cat.icon}</span>
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          deleteMenuCategory(cat.id);
                          toast.success('Category deleted');
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ingredient Categories */}
            <Card className="section-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Ingredient Categories
                </CardTitle>
                <CardDescription>Categories for ingredients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Category name"
                    value={newIngredientCategoryName}
                    onChange={(e) => setNewIngredientCategoryName(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddIngredientCategory}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {ingredientCategories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <span className="font-medium">{cat.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          deleteIngredientCategory(cat.id);
                          toast.success('Category deleted');
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Configure alert preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Low Stock Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified when ingredients are low</p>
                </div>
                <Switch checked={lowStockAlert} onCheckedChange={setLowStockAlert} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Order Notifications</p>
                  <p className="text-sm text-muted-foreground">Sound alerts for new orders</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Reports</p>
                  <p className="text-sm text-muted-foreground">Receive daily sales summary</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}