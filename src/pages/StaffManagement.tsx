import { useState } from 'react';
import { Users, Plus, Edit2, Trash2, UserCircle, ChefHat, Shield, ShieldCheck } from 'lucide-react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Table, Waiter, Staff, UserRole } from '@/types/restaurant';

export default function StaffManagement() {
  const {
    tables, waiters, staff,
    addTable, updateTable, deleteTable,
    addWaiter, updateWaiter, deleteWaiter,
    addStaff, updateStaff, deleteStaff,
  } = useRestaurantStore();

  // Table state
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableForm, setTableForm] = useState({ number: '', capacity: '', floor: 'ground' as 'ground' | 'first' | 'family' });

  // Waiter state
  const [showWaiterDialog, setShowWaiterDialog] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState<Waiter | null>(null);
  const [waiterForm, setWaiterForm] = useState({ name: '', phone: '', isActive: true });

  // Staff state
  const [showStaffDialog, setShowStaffDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffForm, setStaffForm] = useState<{
    name: string;
    phone: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
  }>({ name: '', phone: '', email: '', password: '', role: 'pos_user', isActive: true });

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

  const handleSaveTable = () => {
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
      updateTable(editingTable.id, { number, capacity, floor: tableForm.floor });
      toast.success('Table updated');
    } else {
      addTable({ number, capacity, floor: tableForm.floor });
      toast.success('Table added');
    }
    setShowTableDialog(false);
  };

  const handleDeleteTable = (id: string) => {
    const table = tables.find(t => t.id === id);
    if (table?.status === 'occupied') {
      toast.error('Cannot delete occupied table');
      return;
    }
    deleteTable(id);
    toast.success('Table deleted');
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

  const handleSaveWaiter = () => {
    if (!waiterForm.name.trim()) {
      toast.error('Please enter waiter name');
      return;
    }

    if (editingWaiter) {
      updateWaiter(editingWaiter.id, waiterForm);
      toast.success('Waiter updated');
    } else {
      addWaiter(waiterForm);
      toast.success('Waiter added');
    }
    setShowWaiterDialog(false);
  };

  // Staff handlers
  const handleOpenStaffDialog = (staffMember?: Staff) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setStaffForm({
        name: staffMember.name,
        phone: staffMember.phone,
        email: staffMember.email,
        password: staffMember.password,
        role: staffMember.role,
        isActive: staffMember.isActive,
      });
    } else {
      setEditingStaff(null);
      setStaffForm({ name: '', phone: '', email: '', password: '', role: 'pos_user', isActive: true });
    }
    setShowStaffDialog(true);
  };

  const handleSaveStaff = () => {
    if (!staffForm.name.trim() || !staffForm.email.trim()) {
      toast.error('Please enter name and email');
      return;
    }
    if (!editingStaff && !staffForm.password.trim()) {
      toast.error('Please enter a password');
      return;
    }

    if (editingStaff) {
      updateStaff(editingStaff.id, staffForm);
      toast.success('Staff updated');
    } else {
      addStaff(staffForm);
      toast.success('Staff added');
    }
    setShowStaffDialog(false);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <ShieldCheck className="h-4 w-4" />;
      case 'manager': return <Shield className="h-4 w-4" />;
      default: return <UserCircle className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-destructive/10 text-destructive';
      case 'manager': return 'bg-warning/10 text-warning';
      default: return 'bg-primary/10 text-primary';
    }
  };

  const getFloorLabel = (floor: 'ground' | 'first' | 'family') => {
    switch (floor) {
      case 'ground': return 'Ground Floor';
      case 'first': return 'First Floor';
      case 'family': return 'Family Hall';
    }
  };

  // Table Card Component
  const TableCard = ({ table, onEdit, onDelete }: { table: Table; onEdit: (t: Table) => void; onDelete: (id: string) => void }) => (
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
          onClick={() => onDelete(table.id)}
          disabled={table.status === 'occupied'}
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
                              onClick={() => {
                                deleteWaiter(waiter.id);
                                toast.success('Waiter deleted');
                              }}
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

        {/* Staff Tab */}
        <TabsContent value="staff">
          <Card className="section-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Staff & Users</CardTitle>
                <CardDescription>Manage admins, managers, and POS users</CardDescription>
              </div>
              <Button onClick={() => handleOpenStaffDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Staff
              </Button>
            </CardHeader>
            <CardContent>
              {/* Role Legend */}
              <div className="flex gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full ${getRoleBadge('admin')}`}>Admin</span>
                  <span className="text-muted-foreground">Full access</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full ${getRoleBadge('manager')}`}>Manager</span>
                  <span className="text-muted-foreground">Operational access</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full ${getRoleBadge('pos_user')}`}>POS User</span>
                  <span className="text-muted-foreground">POS & Orders only</span>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              {getRoleIcon(s.role)}
                            </div>
                            <span className="font-medium">{s.name}</span>
                          </div>
                        </td>
                        <td className="text-muted-foreground">{s.email}</td>
                        <td className="text-muted-foreground">{s.phone}</td>
                        <td>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(s.role)}`}>
                            {s.role === 'pos_user' ? 'POS User' : s.role.charAt(0).toUpperCase() + s.role.slice(1)}
                          </span>
                        </td>
                        <td>
                          <span className={s.isActive ? 'badge-success' : 'badge-destructive'}>
                            {s.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenStaffDialog(s)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                deleteStaff(s.id);
                                toast.success('Staff deleted');
                              }}
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
              {staff.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No staff members added yet.
                </div>
              )}
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
              <Label htmlFor="table-capacity">Capacity (Seats)</Label>
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
                placeholder="Ahmed Khan"
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

      {/* Staff Dialog */}
      <Dialog open={showStaffDialog} onOpenChange={setShowStaffDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="staff-name">Name</Label>
              <Input
                id="staff-name"
                value={staffForm.name}
                onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                placeholder="Muhammad Ali"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-email">Email</Label>
              <Input
                id="staff-email"
                type="email"
                value={staffForm.email}
                onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                placeholder="ali@restaurant.pk"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-password">Password {editingStaff && '(leave blank to keep current)'}</Label>
              <Input
                id="staff-password"
                type="password"
                value={staffForm.password}
                onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                placeholder={editingStaff ? '••••••••' : 'Enter password'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-phone">Phone</Label>
              <Input
                id="staff-phone"
                value={staffForm.phone}
                onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                placeholder="+92 300 1234567"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={staffForm.role} onValueChange={(v: UserRole) => setStaffForm({ ...staffForm, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin (Full Access)</SelectItem>
                  <SelectItem value="manager">Manager (Operational)</SelectItem>
                  <SelectItem value="pos_user">POS User (Limited)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={staffForm.isActive}
                onCheckedChange={(checked) => setStaffForm({ ...staffForm, isActive: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStaffDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveStaff}>{editingStaff ? 'Update' : 'Add'} Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
