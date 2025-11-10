"use client"

import { useState, useEffect, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';

export default function AdminOrdersPage() {
  const locale = useLocale();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { el: string; en: string }> = {
      pending: { el: 'Εκκρεμεί', en: 'Pending' },
      paid: { el: 'Πληρώθηκε', en: 'Paid' },
      shipped: { el: 'Απεστάλη', en: 'Shipped' },
      delivered: { el: 'Παραδόθηκε', en: 'Delivered' },
      cancelled: { el: 'Ακυρώθηκε', en: 'Cancelled' },
    };
    return locale === 'el' ? statusMap[status]?.el || status : statusMap[status]?.en || status;
  };

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

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;

    const query = searchQuery.toLowerCase();
    return orders.filter(order => {
      const customerName = (order.customer_name || '').toLowerCase();
      const customerEmail = (order.customer_email || '').toLowerCase();
      const customerPhone = (order.customer_phone || '').toLowerCase();
      const orderId = (order.id || '').toLowerCase();
      const status = (order.status || '').toLowerCase();
      
      return customerName.includes(query) ||
             customerEmail.includes(query) ||
             customerPhone.includes(query) ||
             orderId.includes(query) ||
             status.includes(query);
    });
  }, [orders, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{locale === 'el' ? 'Παραγγελίες' : 'Orders'}</h1>
          <p className="text-muted-foreground">{locale === 'el' ? 'Φόρτωση...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{locale === 'el' ? 'Παραγγελίες' : 'Orders'}</h1>
        <p className="text-sm md:text-base text-muted-foreground">{locale === 'el' ? 'Διαχείριση παραγγελιών πελατών' : 'Manage customer orders'}</p>
      </div>

      {/* Search Bar */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={locale === 'el' ? 'Αναζήτηση παραγγελιών (όνομα, email, τηλέφωνο)...' : 'Search orders (name, email, phone)...'}
      />

      {filteredOrders && filteredOrders.length > 0 ? (
        <div className="grid gap-3 md:gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col gap-3">
                  {/* Header with name and status */}
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm md:text-base truncate">{order.customer_name}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">
                        {order.customer_email}
                      </p>
                      {order.customer_phone && (
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {order.customer_phone}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 md:px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${
                      order.status === 'paid' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  {/* Date and delivery info */}
                  <div className="space-y-1">
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString(locale === 'el' ? 'el-GR' : 'en-US', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {order.order_items?.length || 0} {locale === 'el' ? 'τεμάχια' : 'items'} • 
                      {order.boxnow_locker_id ? ` ${locale === 'el' ? 'BOXNOW Locker' : 'BOXNOW Locker'}` : ` ${locale === 'el' ? 'Παράδοση στο Σπίτι' : 'Home Delivery'}`}
                    </p>
                  </div>

                  {/* Price, payment status and action button */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t">
                    <div className="flex-1">
                      <p className="text-lg md:text-2xl font-bold text-primary">
                        {formatPrice(order.total, locale)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {locale === 'el' ? 'Κατάσταση Πληρωμής' : 'Payment Status'}: {getStatusLabel(order.payment_status)}
                      </p>
                    </div>
                    
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="whitespace-nowrap">
                        <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                        <span className="hidden md:inline">{locale === 'el' ? 'Προβολή' : 'View'}</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 md:p-12 text-center">
            <p className="text-sm md:text-base text-muted-foreground">
              {searchQuery.trim() 
                ? (locale === 'el' ? 'Δεν βρέθηκαν παραγγελίες που να ταιριάζουν με την αναζήτηση' : 'No orders found matching your search')
                : (locale === 'el' ? 'Δεν υπάρχουν παραγγελίες ακόμα' : 'No orders yet')
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
