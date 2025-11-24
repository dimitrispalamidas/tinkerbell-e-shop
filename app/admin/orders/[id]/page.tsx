"use client"

import { use, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
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
  const locale = useLocale();
  const router = useRouter();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderDiscounts, setOrderDiscounts] = useState<any[]>([]);
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
      .select(`
        *,
        order_discounts (
          id,
          discount_code_id,
          product_discount_id,
          discount_amount,
          discount_codes (
            code,
            discount_type,
            discount_value
          ),
          product_discounts (
            discount_type,
            discount_value
          )
        )
      `)
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

      // Set order discounts
      setOrderDiscounts((orderData as any).order_discounts || []);
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
      toast.error(locale === 'el' ? 'Αποτυχία ενημέρωσης κατάστασης' : 'Failed to update order status');
    } else {
      toast.success(locale === 'el' ? 'Η κατάσταση ενημερώθηκε' : 'Order status updated');
      // Redirect to orders list after successful update
      router.push('/admin/orders');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">{locale === 'el' ? 'Φόρτωση...' : 'Loading...'}</div>;
  }

  if (!order) {
    return <div className="text-center py-8">{locale === 'el' ? 'Δεν υπάρχουν παραγγελίες ακόμα' : 'No orders yet'}</div>;
  }

  // Calculate subtotal without discounts (original prices)
  const subtotalWithoutDiscounts = orderItems.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );

  // Calculate total discount amounts
  const productDiscountAmount = orderDiscounts
    .filter((od) => od.product_discount_id)
    .reduce((sum, od) => sum + (od.discount_amount || 0), 0);
  
  const codeDiscountAmount = orderDiscounts
    .filter((od) => od.discount_code_id)
    .reduce((sum, od) => sum + (od.discount_amount || 0), 0);

  const totalDiscountAmount = productDiscountAmount + codeDiscountAmount;
  const subtotalWithDiscounts = subtotalWithoutDiscounts - totalDiscountAmount;
  
  // Shipping cost = total - subtotal with discounts
  const shippingCost = order.total - subtotalWithDiscounts;

  // Get discount code info
  const discountCodeInfo = orderDiscounts.find((od) => od.discount_code_id && od.discount_codes);
  const discountCode = discountCodeInfo?.discount_codes;

  const hasDiscounts = totalDiscountAmount > 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{locale === 'el' ? 'Λεπτομέρειες Παραγγελίας' : 'Order Details'}</h1>
          <p className="text-muted-foreground">{locale === 'el' ? 'Αριθμός Παραγγελίας' : 'Order ID'}: {order.id}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{locale === 'el' ? 'Στοιχεία Πελάτη' : 'Customer Information'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">{locale === 'el' ? 'Όνομα' : 'Name'}</p>
              <p className="font-medium">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{locale === 'el' ? 'Email' : 'Email'}</p>
              <p className="font-medium">{order.customer_email}</p>
            </div>
            {order.customer_phone && (
              <div>
                <p className="text-sm text-muted-foreground">{locale === 'el' ? 'Τηλέφωνο' : 'Phone'}</p>
                <p className="font-medium">{order.customer_phone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">{locale === 'el' ? 'Ημερομηνία' : 'Date'}</p>
              <p className="font-medium">
                {new Date(order.created_at).toLocaleString(locale === 'el' ? 'el-GR' : 'en-US')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{locale === 'el' ? 'Τρόπος Παράδοσης' : 'Delivery Method'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">{locale === 'el' ? 'Μέθοδος' : 'Method'}</p>
              <p className="font-medium">
                {order.shipping_address?.delivery_method === 'home' 
                  ? (locale === 'el' ? 'Παράδοση στο Σπίτι' : 'Home Delivery')
                  : (locale === 'el' ? 'BoxNow Locker' : 'BoxNow Locker')}
              </p>
            </div>

            {order.boxnow_locker_id && (
              <div>
                <p className="text-sm text-muted-foreground">{locale === 'el' ? 'Κωδικός Locker' : 'Locker ID'}</p>
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
          <CardTitle>{locale === 'el' ? 'Προϊόντα Παραγγελίας' : 'Order Items'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'el' ? 'Ποσότητα' : 'Quantity'}: {item.quantity}
                    {item.size && ` • ${locale === 'el' ? 'Μέγεθος' : 'Size'}: ${item.size}`}
                    {item.color && ` • ${locale === 'el' ? 'Χρώμα' : 'Color'}: ${item.color}`}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(item.price * item.quantity, locale)}</p>
              </div>
            ))}
            
            <div className="border-t pt-4 space-y-2">
              {/* Subtotal without discounts */}
              {hasDiscounts && (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {locale === 'el' ? 'Αρχικό Υποσύνολο' : 'Original Subtotal'}
                  </p>
                  <p className="text-sm text-muted-foreground line-through">
                    {formatPrice(subtotalWithoutDiscounts, locale)}
                  </p>
                </div>
              )}

              {/* Product Discounts */}
              {productDiscountAmount > 0 && (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-green-600 font-medium">
                    {locale === 'el' ? 'Έκπτωση Προϊόντων' : 'Product Discount'}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    -{formatPrice(productDiscountAmount, locale)}
                  </p>
                </div>
              )}

              {/* Discount Code */}
              {codeDiscountAmount > 0 && discountCode && (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-green-600 font-medium">
                    {locale === 'el' ? 'Έκπτωση Κωδικού' : 'Discount Code'} ({discountCode.code})
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    -{formatPrice(codeDiscountAmount, locale)}
                  </p>
                </div>
              )}

              {/* Subtotal with discounts */}
              {hasDiscounts && (
                <div className="flex justify-between items-center pt-2 border-t">
                  <p className="text-base font-semibold">
                    {locale === 'el' ? 'Υποσύνολο' : 'Subtotal'}
                  </p>
                  <p className="text-base font-semibold">
                    {formatPrice(subtotalWithDiscounts, locale)}
                  </p>
                </div>
              )}

              {/* Shipping */}
              {shippingCost > 0 && (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {locale === 'el' ? 'Μεταφορικά' : 'Shipping'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    +{formatPrice(shippingCost, locale)}
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center pt-2 border-t">
                <p className="text-lg font-bold">{locale === 'el' ? 'Σύνολο' : 'Total'}</p>
                <p className={`text-2xl font-bold ${hasDiscounts ? 'text-[#ffb3d9]' : 'text-primary'}`}>
                  {formatPrice(order.total, locale)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{locale === 'el' ? 'Ενημέρωση Κατάστασης' : 'Update Status'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{locale === 'el' ? 'Κατάσταση Παραγγελίας' : 'Order Status'}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="pending">{locale === 'el' ? 'Εκκρεμεί' : 'Pending'}</option>
              <option value="paid">{locale === 'el' ? 'Πληρώθηκε' : 'Paid'}</option>
              <option value="shipped">{locale === 'el' ? 'Απεστάλη' : 'Shipped'}</option>
              <option value="delivered">{locale === 'el' ? 'Παραδόθηκε' : 'Delivered'}</option>
              <option value="cancelled">{locale === 'el' ? 'Ακυρώθηκε' : 'Cancelled'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{locale === 'el' ? 'BOXNOW Locker' : 'BOXNOW Locker'}</label>
            <Input
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder={locale === 'el' ? 'Κωδικός Συναλλαγής' : 'Transaction ID'}
            />
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{locale === 'el' ? 'Κατάσταση Πληρωμής' : 'Payment Status'}: {order.payment_status === 'paid' ? (locale === 'el' ? 'Πληρώθηκε' : 'Paid') : (locale === 'el' ? 'Εκκρεμεί' : 'Pending')}</p>
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
            {locale === 'el' ? 'Ενημέρωση Κατάστασης' : 'Update Status'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
