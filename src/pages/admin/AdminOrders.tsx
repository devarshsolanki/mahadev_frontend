import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Search, Eye } from 'lucide-react';
import { useState } from 'react';
import { adminApi, OrderUpdatePayload } from '@/api/admin';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import OrderDetailsDialog from '@/components/admin/OrderDetailsDialog';

const OrderStatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(
        status
      )}`}
    >
      {status}
    </span>
  );
};

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const limit = 10;

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', search, status, page],
    queryFn: () =>
      adminApi.getAllOrders({
        search,
        status: status === 'all' ? undefined : status,
        page,
        limit,
      }),
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: OrderUpdatePayload;
    }) => adminApi.updateOrder(orderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update order status');
    },
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateOrderMutation.mutateAsync({
      orderId,
      payload: { status: newStatus as OrderUpdatePayload['status'] },
    });
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const ordersData = orders?.data || [];
  const totalPages = Math.ceil((orders?.total || 0) / limit);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground">Manage and track all orders</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Product Image</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Product Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Quantity</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersData.map((order: any) => (
                <tr key={order._id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm align-top">
                    <div className="flex flex-col gap-2">
                      {order.items?.map((item: any, index: number) => (
                        <div key={index} className="h-12 w-12 flex-shrink-0 rounded border bg-muted overflow-hidden">
                          <img
                            src={item.product?.images?.[0] || '/placeholder.png'}
                            alt={item.product?.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm align-top">
                    <div className="flex flex-col gap-2">
                      {order.items?.map((item: any, index: number) => (
                        <div key={index} className="flex h-12 items-center">
                          <span className="line-clamp-2 max-w-[200px]" title={item.product?.name}>
                            {item.product?.name || 'Product Unavailable'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm align-top">
                    <div className="flex flex-col gap-2">
                      {order.items?.map((item: any, index: number) => (
                        <div key={index} className="flex h-12 items-center">
                          {item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm align-top">
                    <div className="mt-2 font-medium">{order.user?.name || 'Unknown User'}</div>
                    <div className="text-xs text-muted-foreground">{order.user?.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-sm align-top">
                    <div className="mt-2 font-medium">₹{order.total}</div>
                  </td>
                  <td className="px-4 py-3 text-sm align-top">
                    <div className="mt-2">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm align-top">
                    <div className="mt-2 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm align-top">
                    <div className="mt-1 flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleViewDetails(order)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order._id, value)}
                        disabled={order.status === 'delivered' || order.status === 'cancelled'}
                      >
                        <SelectTrigger className="h-8 w-[140px]">
                          <SelectValue placeholder="Update" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <OrderDetailsDialog
        order={selectedOrder}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
};

export default AdminOrders;