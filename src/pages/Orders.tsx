import { useState } from 'react';
import { Search, Eye, FileText, Calendar, Printer, Users } from 'lucide-react';
import { useRestaurantStore } from '@/store/restaurantStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Order } from '@/types/restaurant';

export default function Orders() {
  const { orders, settings } = useRestaurantStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const formatPrice = (price: number) => `${settings.currencySymbol} ${price.toLocaleString()}`;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.waiterName?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'cancelled': return 'badge-destructive';
      case 'refunded': return 'badge-destructive';
      default: return 'badge-warning';
    }
  };

  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.orderNumber}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .header h1 { font-size: 16px; margin: 0; }
            .header p { font-size: 11px; margin: 3px 0; }
            .info { margin: 10px 0; font-size: 12px; }
            .info-row { display: flex; justify-content: space-between; margin: 3px 0; }
            .items { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; font-size: 12px; }
            .totals { margin: 10px 0; font-size: 12px; }
            .total-row { display: flex; justify-content: space-between; margin: 3px 0; }
            .grand-total { font-size: 16px; font-weight: bold; border-top: 2px solid #000; padding-top: 5px; margin-top: 5px; }
            .footer { text-align: center; font-size: 10px; margin-top: 15px; }
            @media print { body { margin: 0; padding: 10px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${settings.name}</h1>
            <p>${settings.address}</p>
            <p>Tel: ${settings.phone}</p>
            <p>================================</p>
            <p>Order: ${order.orderNumber}</p>
            <p>${new Date(order.createdAt).toLocaleString('en-PK')}</p>
          </div>
          <div class="info">
            <div class="info-row"><span>Type:</span> <span>${order.orderType.toUpperCase()}</span></div>
            ${order.tableNumber ? `<div class="info-row"><span>Table:</span> <span>#${order.tableNumber}</span></div>` : ''}
            ${order.waiterName ? `<div class="info-row"><span>Waiter:</span> <span>${order.waiterName}</span></div>` : ''}
            ${order.customerName ? `<div class="info-row"><span>Customer:</span> <span>${order.customerName}</span></div>` : ''}
          </div>
          <div class="items">
            ${order.items
              .map(
                (item) => `
              <div class="item">
                <span>${item.quantity}x ${item.menuItemName}</span>
                <span>${settings.currencySymbol} ${item.total.toLocaleString()}</span>
              </div>
            `
              )
              .join('')}
          </div>
          <div class="totals">
            <div class="total-row"><span>Subtotal:</span> <span>${settings.currencySymbol} ${order.subtotal.toLocaleString()}</span></div>
            <div class="total-row"><span>GST (${settings.taxRate}%):</span> <span>${settings.currencySymbol} ${order.tax.toLocaleString()}</span></div>
            ${order.discount > 0 ? `<div class="total-row"><span>Discount:</span> <span>-${settings.currencySymbol} ${order.discount.toLocaleString()}</span></div>` : ''}
            <div class="total-row grand-total"><span>TOTAL:</span> <span>${settings.currencySymbol} ${order.total.toLocaleString()}</span></div>
          </div>
          <div class="footer">
            <p>Payment: ${order.paymentMethod.toUpperCase()}</p>
            <p>================================</p>
            <p>Thank you for dining with us!</p>
            <p>شکریہ - Shukriya!</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Order History</h1>
        <p className="page-subtitle">View and manage all orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order number, customer, or waiter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="section-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date & Time</th>
              <th>Customer</th>
              <th>Waiter</th>
              <th>Type</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="font-medium font-mono">{order.orderNumber}</td>
                <td>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(order.createdAt), 'MMM dd, HH:mm')}
                  </div>
                </td>
                <td>
                  {order.customerName || <span className="text-muted-foreground">Walk-in</span>}
                  {order.tableNumber && (
                    <span className="ml-2 text-xs text-muted-foreground">(Table {order.tableNumber})</span>
                  )}
                </td>
                <td>
                  {order.waiterName ? (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {order.waiterName}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td>
                  <span className="capitalize">{order.orderType}</span>
                </td>
                <td>{order.items.length} items</td>
                <td className="font-semibold">{formatPrice(order.total)}</td>
                <td className="capitalize">{order.paymentMethod}</td>
                <td>
                  <span className={getStatusColor(order.status)}>{order.status}</span>
                </td>
                <td>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handlePrintInvoice(order)}>
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 font-medium">No orders found</p>
            <p className="text-sm text-muted-foreground">Orders will appear here once created from POS</p>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order Number</p>
                  <p className="font-mono font-medium">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <span className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</span>
                </div>
                <div>
                  <p className="text-muted-foreground">Date & Time</p>
                  <p className="font-medium">{format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Type</p>
                  <p className="font-medium capitalize">{selectedOrder.orderType}</p>
                </div>
                {selectedOrder.customerName && (
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                )}
                {selectedOrder.tableNumber && (
                  <div>
                    <p className="text-muted-foreground">Table</p>
                    <p className="font-medium">{selectedOrder.tableNumber}</p>
                  </div>
                )}
                {selectedOrder.waiterName && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Waiter</p>
                    <p className="font-medium">{selectedOrder.waiterName}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.menuItemName}
                        {item.notes && <span className="text-muted-foreground ml-1">({item.notes})</span>}
                      </span>
                      <span className="font-medium">{formatPrice(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST ({settings.taxRate}%)</span>
                  <span>{formatPrice(selectedOrder.tax)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discount</span>
                    <span>-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="capitalize">{selectedOrder.paymentMethod}</span>
                </div>
              </div>

              <Button className="w-full" onClick={() => handlePrintInvoice(selectedOrder)}>
                <Printer className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
