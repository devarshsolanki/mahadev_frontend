import { useQuery } from '@tanstack/react-query';
import { Loader2, Package, ShoppingCart, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statsData = stats?.data || {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/admin/products" className="text-primary hover:underline">
                Manage products
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/admin/orders" className="text-primary hover:underline">
                View all orders
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{statsData.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Recent Orders</h2>
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {statsData.recentOrders.map((order: any) => (
                  <tr key={order._id} className="border-b">
                    <td className="px-4 py-3 text-sm">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="text-primary hover:underline"
                      >
                        {order._id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">{order.user.name}</td>
                    <td className="px-4 py-3 text-sm capitalize">{order.status}</td>
                    <td className="px-4 py-3 text-sm">₹{order.total}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;