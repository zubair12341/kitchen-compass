import { useState } from 'react';
import { Users, Plus, Edit2, Trash2, ChefHat, Shield, ShieldCheck, AlertCircle } from 'lucide-react';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Table, Waiter } from '@/types/restaurant';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

export default function StaffManagement() {
  const {
    tables, waiters,
    addTable, updateTable, deleteTable,
    addWaiter, updateWaiter, deleteWaiter,
  } = useRestaurant();

  // Table state
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableForm, setTableForm] = useState({ number: '', capacity: '', floor: 'ground' as 'ground' | 'first' | 'family' });

  // Waiter state
  const [showWaiterDialog, setShowWaiterDialog] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState<Waiter | null>(null);
  const [waiterForm, setWaiterForm] = useState({ name: '', phone: '', isActive: true });
  
  // Delete confirmation state
  const [deleteTableTarget, setDeleteTableTarget] = useState<Table | null>(null);
  const [deleteWaiterTarget, setDeleteWaiterTarget] = useState<Waiter | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Table handlers
  const handleOpenTableDialog = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setTableForm({ number: table.number.toString(), capacity: table.capacity.toString(), floor: table.floor });
    } else {
      setEditingTable(null);
      setTableForm({ number: '', capacity: '4', floor: 'ground' });
    }
    setShowTableDialog(true);
  };

  const handleSaveTable = async () => {
    const number = parseInt(tableForm.number);
    const capacity = parseInt(tableForm.capacity);
    
    if (isNaN(number) || number <= 0) {
      toast.error('Please enter a valid table number');
      return;
    }
    if (isNaN(capacity) || capacity <= 0) {
      toast.error('Please enter a valid capacity');
      return;
    }

    if (editingTable) {
      await updateTable(editingTable.id, { number, capacity, floor: tableForm.floor });
      toast.success('Table updated');
    } else {
      await addTable({ number, capacity, floor: tableForm.floor });
      toast.success('Table added');
    }
    setShowTableDialog(false);
  };

  const handleDeleteTable = (table: Table) => {
    if (table.status === 'occupied') {
      toast.error('Cannot delete occupied table');
      return;
    }
    setDeleteTableTarget(table);
  };
  
  const handleDeleteTableConfirm = async () => {
    if (!deleteTableTarget) return;
    setIsDeleting(true);
    try {
      await deleteTable(deleteTableTarget.id);
      toast.success('Table deleted');
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setIsDeleting(false);
      setDeleteTableTarget(null);
    }
  };
  
  const handleDeleteWaiter = (waiter: Waiter) => {
    setDeleteWaiterTarget(waiter);
  };
  
  const handleDeleteWaiterConfirm = async () => {
    if (!deleteWaiterTarget) return;
    setIsDeleting(true);
    try {
      await deleteWaiter(deleteWaiterTarget.id);
      toast.success('Waiter deleted');
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setIsDeleting(false);
      setDeleteWaiterTarget(null);
    }
  };

  // Waiter handlers
  const handleOpenWaiterDialog = (waiter?: Waiter) => {
    if (waiter) {
      setEditingWaiter(waiter);
      setWaiterForm({ name: waiter.name, phone: waiter.phone, isActive: waiter.isActive });
    } else {
      setEditingWaiter(null);
      setWaiterForm({ name: '', phone: '', isActive: true });
    }
    setShowWaiterDialog(true);
  };

  const handleSaveWaiter = async () => {
    if (!waiterForm.name.trim()) {
      toast.error('Please enter waiter name');
      return;
    }

    if (editingWaiter) {
      await updateWaiter(editingWaiter.id, waiterForm);
      toast.success('Waiter updated');
    } else {
      await addWaiter(waiterForm);
      toast.success('Waiter added');
    }
    setShowWaiterDialog(false);
  };

  const getFloorLabel = (floor: 'ground' | 'first' | 'family') => {
    switch (floor) {
      case 'ground': return 'Ground Floor';
      case 'first': return 'First Floor';
      case 'family': return 'Family Hall';
    }
  };

  // Table Card Component
  const TableCard = ({ table, onEdit, onDelete }: { table: Table; onEdit: (t: Table) => void; onDelete: (t: Table) => void }) => (
    <div
      className={`relative rounded-xl border-2 p-4 ${
        table.status === 'occupied'
          ? 'border-destructive bg-destructive/5'
          : 'border-success bg-success/5'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold">Table {table.number}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          table.status === 'occupied' ? 'bg-destructive text-destructive-foreground' : 'bg-success text-success-foreground'
        }`}>
          {table.status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-1">Capacity: {table.capacity} seats</p>
      <p className="text-xs text-muted-foreground mb-3">{getFloorLabel(table.floor)}</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(table)}>
          <Edit2 className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          disabled={table.status === 'occupied'}
          onClick={() => onDelete(table)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Staff Management</h1>
        <p className="page-subtitle">Manage tables, waiters, and staff members</p>
      </div>

      <Tabs defaultValue="tables" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="waiters">Waiters</TabsTrigger>
          <TabsTrigger value="staff">Staff & Users</TabsTrigger>
        </TabsList>

        {/* Tables Tab */}
        <TabsContent value="tables">
          <Card className="section-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Restaurant Tables</CardTitle>
                <CardDescription>Manage dining tables and capacity</CardDescription>
              </div>
              <Button onClick={() => handleOpenTableDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Table
              </Button>
            </CardHeader>
            <CardContent>
              {/* Ground Floor */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Ground Floor
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {tables
                    .filter((t) => t.floor === 'ground')
                    .sort((a, b) => a.number - b.number)
                    .map((table) => (
                      <TableCard
                        key={table.id}
                        table={table}
                        onEdit={handleOpenTableDialog}
                        onDelete={handleDeleteTable}
                      />
                    ))}
                </div>
              </div>

              {/* First Floor */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  First Floor
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {tables
                    .filter((t) => t.floor === 'first')
                    .sort((a, b) => a.number - b.number)
                    .map((table) => (
                      <TableCard
                        key={table.id}
                        table={table}
                        onEdit={handleOpenTableDialog}
                        onDelete={handleDeleteTable}
                      />
                    ))}
                </div>
              </div>

              {/* Family Hall */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                  Family Hall
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {tables
                    .filter((t) => t.floor === 'family')
                    .sort((a, b) => a.number - b.number)
                    .map((table) => (
                      <TableCard
                        key={table.id}
                        table={table}
                        onEdit={handleOpenTableDialog}
                        onDelete={handleDeleteTable}
                      />
                    ))}
                </div>
              </div>

              {tables.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No tables configured. Add your first table.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Waiters Tab */}
        <TabsContent value="waiters">
          <Card className="section-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Waiters</CardTitle>
                <CardDescription>Manage restaurant waiters</CardDescription>
              </div>
              <Button onClick={() => handleOpenWaiterDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Waiter
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waiters.map((waiter) => (
                      <tr key={waiter.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <ChefHat className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium">{waiter.name}</span>
                          </div>
                        </td>
                        <td className="text-muted-foreground">{waiter.phone}</td>
                        <td>
                          <span className={waiter.isActive ? 'badge-success' : 'badge-destructive'}>
                            {waiter.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenWaiterDialog(waiter)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteWaiter(waiter)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {waiters.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No waiters added yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab - Placeholder for Supabase Auth */}
        <TabsContent value="staff">
          <Card className="section-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff & Users
              </CardTitle>
              <CardDescription>Manage admins, managers, and POS users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Staff Users Managed via Authentication</AlertTitle>
                <AlertDescription>
                  Staff users (Admin, Manager, POS User) are managed through the authentication system. 
                  New staff accounts can be created by an Admin using the backend. User roles are stored 
                  in the database and control access permissions throughout the application.
                </AlertDescription>
              </Alert>

              {/* Role Legend */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <ShieldCheck className="h-5 w-5 text-destructive" />
                    </div>
                    <span className="font-semibold">Admin</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Full access to all features including staff management, settings, and reports.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-warning/10">
                      <Shield className="h-5 w-5 text-warning" />
                    </div>
                    <span className="font-semibold">Manager</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Operational access to POS, menu, stock, orders, and reports. Cannot manage staff.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-semibold">POS User</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Limited to POS operations and viewing orders only.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Table Dialog */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTable ? 'Edit Table' : 'Add Table'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="table-number">Table Number</Label>
              <Input
                id="table-number"
                type="number"
                min="1"
                value={tableForm.number}
                onChange={(e) => setTableForm({ ...tableForm, number: e.target.value })}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="table-capacity">Capacity (seats)</Label>
              <Input
                id="table-capacity"
                type="number"
                min="1"
                value={tableForm.capacity}
                onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
                placeholder="4"
              />
            </div>
            <div className="space-y-2">
              <Label>Floor</Label>
              <Select value={tableForm.floor} onValueChange={(v: 'ground' | 'first' | 'family') => setTableForm({ ...tableForm, floor: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ground">Ground Floor</SelectItem>
                  <SelectItem value="first">First Floor</SelectItem>
                  <SelectItem value="family">Family Hall</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTableDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveTable}>{editingTable ? 'Update' : 'Add'} Table</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Waiter Dialog */}
      <Dialog open={showWaiterDialog} onOpenChange={setShowWaiterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingWaiter ? 'Edit Waiter' : 'Add Waiter'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="waiter-name">Name</Label>
              <Input
                id="waiter-name"
                value={waiterForm.name}
                onChange={(e) => setWaiterForm({ ...waiterForm, name: e.target.value })}
                placeholder="Muhammad Ali"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waiter-phone">Phone</Label>
              <Input
                id="waiter-phone"
                value={waiterForm.phone}
                onChange={(e) => setWaiterForm({ ...waiterForm, phone: e.target.value })}
                placeholder="+92 300 1234567"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={waiterForm.isActive}
                onCheckedChange={(checked) => setWaiterForm({ ...waiterForm, isActive: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWaiterDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveWaiter}>{editingWaiter ? 'Update' : 'Add'} Waiter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Table Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteTableTarget}
        onOpenChange={(open) => !open && setDeleteTableTarget(null)}
        title="Delete Table?"
        itemName={deleteTableTarget ? `Table ${deleteTableTarget.number}` : undefined}
        onConfirm={handleDeleteTableConfirm}
        isLoading={isDeleting}
      />
      
      {/* Delete Waiter Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteWaiterTarget}
        onOpenChange={(open) => !open && setDeleteWaiterTarget(null)}
        title="Delete Waiter?"
        itemName={deleteWaiterTarget?.name}
        onConfirm={handleDeleteWaiterConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}
