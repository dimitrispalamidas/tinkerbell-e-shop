"use client"

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Order, OrderItem } from '@/lib/types/database';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [trackingCode, setTrackingCode] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [unwrappedParams.id]);

  const fetchOrder = async () => {
    const supabase = createClient();

    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('id', unwrappedParams.id)
      .single();

    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', unwrappedParams.id);

    if (orderData) {
      setOrder(orderData as Order);
      setStatus(orderData.status);
      setTrackingCode(orderData.boxnow_tracking_code || '');
    }
    if (itemsData) {
      setOrderItems(itemsData as OrderItem[]);
    }
    setIsLoading(false);
  };

  const handleUpdateOrder = async () => {
    const supabase = createClient();

    const { error } = await supabase
      .from('orders')
      .update({
        status,
        boxnow_tracking_code: trackingCode || null,
      })
      .eq('id', unwrappedParams.id);

    if (error) {
      toast.error('Failed to update order');
    } else {
      toast.success('Order updated successfully');
      fetchOrder();
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!order) {
    return <div className="text-center py-8">Order not found</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="text-muted-foreground">Order ID: {order.id}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{order.customer_email}</p>
            </div>
            {order.customer_phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{order.customer_phone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">
                {new Date(order.created_at).toLocaleString('el-GR')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {order.boxnow_locker_id && (
              <div>
                <p className="text-sm text-muted-foreground">BOXNOW Locker ID</p>
                <p className="font-medium">{order.boxnow_locker_id}</p>
              </div>
            )}
            {order.shipping_address && (
              <div>
                <p className="text-sm text-muted-foreground">Shipping Address</p>
                <p className="font-medium">{JSON.stringify(order.shipping_address)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                    {item.size && ` • Size: ${item.size}`}
                    {item.color && ` • Color: ${item.color}`}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(item.price * item.quantity, 'el')}</p>
              </div>
            ))}
            
            <div className="border-t pt-4 flex justify-between items-center">
              <p className="text-lg font-bold">Total</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(order.total, 'el')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">BOXNOW Tracking Code</label>
            <Input
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Enter tracking code"
            />
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Payment Status: {order.payment_status}</p>
            {order.viva_order_code && (
              <p className="text-sm text-muted-foreground">
                Viva Order Code: {order.viva_order_code}
              </p>
            )}
            {order.viva_transaction_id && (
              <p className="text-sm text-muted-foreground">
                Viva Transaction ID: {order.viva_transaction_id}
              </p>
            )}
          </div>

          <Button onClick={handleUpdateOrder} className="w-full">
            Update Order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

