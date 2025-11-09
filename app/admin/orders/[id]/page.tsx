"use client"

import { use, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
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
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  
  // Store original data for comparison
  const [originalStatus, setOriginalStatus] = useState('');
  const [originalTrackingCode, setOriginalTrackingCode] = useState('');

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
      const orderStatus = orderData.status;
      const orderTracking = orderData.boxnow_tracking_code || '';
      
      setStatus(orderStatus);
      setTrackingCode(orderTracking);
      
      // Store original data
      setOriginalStatus(orderStatus);
      setOriginalTrackingCode(orderTracking);
    }
    if (itemsData) {
      setOrderItems(itemsData as OrderItem[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [unwrappedParams.id]);

  // Check if there are any changes
  const hasChanges = useMemo(() => {
    return status !== originalStatus || trackingCode !== originalTrackingCode;
  }, [status, trackingCode, originalStatus, originalTrackingCode]);

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
      toast.error(t('failed_update_order_status'));
    } else {
      toast.success(t('order_status_updated'));
      fetchOrder();
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">{tCommon('loading')}</div>;
  }

  if (!order) {
    return <div className="text-center py-8">{t('no_orders')}</div>;
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
          <h1 className="text-3xl font-bold">{t('order_detail_title')}</h1>
          <p className="text-muted-foreground">{t('order_id')}: {order.id}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('customer_info')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">{t('customer_name')}</p>
              <p className="font-medium">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('customer_email')}</p>
              <p className="font-medium">{order.customer_email}</p>
            </div>
            {order.customer_phone && (
              <div>
                <p className="text-sm text-muted-foreground">{t('customer_phone')}</p>
                <p className="font-medium">{order.customer_phone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">{t('date')}</p>
              <p className="font-medium">
                {new Date(order.created_at).toLocaleString(locale === 'el' ? 'el-GR' : 'en-US')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('delivery_method')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">{locale === 'el' ? 'Μέθοδος' : 'Method'}</p>
              <p className="font-medium">
                {order.shipping_address?.delivery_method === 'home' 
                  ? t('home_delivery')
                  : t('boxnow_locker')}
              </p>
            </div>

            {order.boxnow_locker_id && (
              <div>
                <p className="text-sm text-muted-foreground">{t('locker_id')}</p>
                <p className="font-medium">{order.boxnow_locker_id}</p>
              </div>
            )}

            {order.shipping_address && order.shipping_address.delivery_method === 'home' && (
              <>
                {order.shipping_address.address && (
                  <div>
                    <p className="text-sm text-muted-foreground">{locale === 'el' ? 'Διεύθυνση' : 'Address'}</p>
                    <p className="font-medium">{order.shipping_address.address}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {order.shipping_address.city && (
                    <div>
                      <p className="text-sm text-muted-foreground">{locale === 'el' ? 'Πόλη' : 'City'}</p>
                      <p className="font-medium">{order.shipping_address.city}</p>
                    </div>
                  )}
                  {order.shipping_address.postal_code && (
                    <div>
                      <p className="text-sm text-muted-foreground">{locale === 'el' ? 'Τ.Κ.' : 'Postal Code'}</p>
                      <p className="font-medium">{order.shipping_address.postal_code}</p>
                    </div>
                  )}
                </div>
                {order.shipping_address.region && (
                  <div>
                    <p className="text-sm text-muted-foreground">{locale === 'el' ? 'Περιοχή' : 'Region'}</p>
                    <p className="font-medium">{order.shipping_address.region}</p>
                  </div>
                )}
              </>
            )}

            {order.boxnow_tracking_code && (
              <div>
                <p className="text-sm text-muted-foreground">{locale === 'el' ? 'Tracking Code' : 'Tracking Code'}</p>
                <p className="font-medium font-mono text-xs">{order.boxnow_tracking_code}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('order_items')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('quantity')}: {item.quantity}
                    {item.size && ` • ${t('size')}: ${item.size}`}
                    {item.color && ` • ${t('color')}: ${item.color}`}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(item.price * item.quantity, locale)}</p>
              </div>
            ))}
            
            <div className="border-t pt-4 flex justify-between items-center">
              <p className="text-lg font-bold">{t('total')}</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(order.total, locale)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('update_order_status')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('order_status')}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="pending">{t('pending')}</option>
              <option value="paid">{t('paid')}</option>
              <option value="shipped">{t('shipped')}</option>
              <option value="delivered">{t('delivered')}</option>
              <option value="cancelled">{t('cancelled')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('boxnow_locker')}</label>
            <Input
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder={t('transaction_id')}
            />
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t('payment_status')}: {t(order.payment_status)}</p>
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

          <Button onClick={handleUpdateOrder} className="w-full" disabled={!hasChanges}>
            {t('update_order_status')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
