"use client"

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminOrdersPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('orders_title')}</h1>
          <p className="text-muted-foreground">{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('orders_title')}</h1>
        <p className="text-muted-foreground">{t('orders_subtitle')}</p>
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
                        {t(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.customer_email} • {order.customer_phone || '-'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString(locale === 'el' ? 'el-GR' : 'en-US')}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {order.order_items?.length || 0} {t('items')} • 
                      {order.boxnow_locker_id ? ` ${t('boxnow_locker')}: ${order.boxnow_locker_id}` : ` ${t('home_delivery')}`}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(order.total, locale)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('payment_status')}: {t(order.payment_status)}
                    </p>
                  </div>

                  <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      {t('view_details')}
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
            <p className="text-muted-foreground">{t('no_orders')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
