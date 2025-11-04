import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex gap-4 items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold">{order.customer_name}</h3>
                      <span className={`px-3 py-1 rounded text-xs font-medium ${
                        order.status === 'paid' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.customer_email} • {order.customer_phone || 'No phone'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString('el-GR')}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {order.order_items?.length || 0} items • 
                      {order.boxnow_locker_id ? ` BOXNOW: ${order.boxnow_locker_id}` : ' No delivery method'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(order.total, 'el')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Payment: {order.payment_status}
                    </p>
                  </div>

                  <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No orders yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

