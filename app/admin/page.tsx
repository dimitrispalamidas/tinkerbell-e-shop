"use client"

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const locale = useLocale();
  
  const [stats, setStats] = useState<{
    products: any[];
    orders: any[];
    todaySales: number;
    soldOutProducts: any[];
    topSellingProducts: any[];
    totalOrders: number;
  }>({
    products: [],
    orders: [],
    todaySales: 0,
    soldOutProducts: [],
    topSellingProducts: [],
    totalOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const supabase = createClient();

      // Get active products only
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .neq('status', 'archived');

      // Get all paid orders for total count
      const { data: allPaidOrders, count: totalOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: false })
        .eq('payment_status', 'paid');

      // Get recent paid orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get today's sales (paid orders only)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('total')
        .eq('payment_status', 'paid')
        .gte('created_at', today.toISOString());

      // Get sold out products
      const { data: soldOutProducts } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .eq('status', 'sold_out')
        .order('updated_at', { ascending: false })
        .limit(5);

      // Get top selling products
      const { data: allProducts } = await supabase
        .from('products')
        .select('*, product_variants(*)');

      const topSellingProducts = allProducts
        ?.map(product => {
          const totalSold = product.product_variants?.reduce(
            (sum: number, variant: any) => sum + (variant.sold_count || 0),
            0
          ) || 0;
          return {
            ...product,
            totalSold
          };
        })
        .filter(p => p.totalSold > 0)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5) || [];

      const todaySales = todayOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

      setStats({
        products: products || [],
        orders: orders || [],
        todaySales,
        soldOutProducts: soldOutProducts || [],
        topSellingProducts,
        totalOrders: totalOrdersCount || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">
          {locale === 'el' ? 'Φόρτωση...' : 'Loading...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          {locale === 'el' ? 'Πίνακας Ελέγχου' : 'Dashboard'}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {locale === 'el' ? 'Επισκόπηση του καταστήματος' : 'Store overview'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">
              {locale === 'el' ? 'Σύνολο Προϊόντων' : 'Total Products'}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-xl md:text-2xl font-bold">{stats.products.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">
              {locale === 'el' ? 'Σύνολο Παραγγελιών' : 'Total Orders'}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-xl md:text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">
              {locale === 'el' ? 'Πωλήσεις Σήμερα' : 'Sales Today'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-xl md:text-2xl font-bold">{formatPrice(stats.todaySales, locale)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">
              {locale === 'el' ? 'Εξαντλημένα Προϊόντα' : 'Sold Out Products'}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-xl md:text-2xl font-bold">{stats.soldOutProducts.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">
            {locale === 'el' ? 'Πρόσφατες Παραγγελίες' : 'Recent Orders'}
          </CardTitle>
          <Link href="/admin/orders" className="text-xs md:text-sm text-primary hover:underline">
            {locale === 'el' ? 'Προβολή Όλων' : 'View All'}
          </Link>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          {stats.orders.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {stats.orders.map((order: any) => (
                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 md:pb-4 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm md:text-base truncate">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{order.customer_name}</p>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                    <p className="font-medium text-sm md:text-base">{formatPrice(order.total, locale)}</p>
                    <p className={`text-xs px-2 py-1 rounded ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {getStatusLabel(order.status)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4 text-sm">
              {locale === 'el' ? 'Δεν υπάρχουν παραγγελίες ακόμα' : 'No orders yet'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Selling & Sold Out Products */}
      <div className="grid gap-3 md:gap-4 md:grid-cols-2">
        {/* Top Selling */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">
              {locale === 'el' ? 'Κορυφαίες Πωλήσεις' : 'Top Selling'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {stats.topSellingProducts.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {stats.topSellingProducts.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between gap-2">
                    <p className="text-xs md:text-sm truncate flex-1">{locale === 'el' ? product.name_el : product.name_en}</p>
                    <span className="text-xs md:text-sm font-medium whitespace-nowrap">
                      {product.totalSold} {locale === 'el' ? 'Πωλήθηκαν' : 'Sold'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4 text-sm">
                {locale === 'el' ? 'Δεν υπάρχουν πωλήσεις ακόμα' : 'No sales yet'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sold Out Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">
              {locale === 'el' ? 'Εξαντλημένα Προϊόντα' : 'Sold Out Products'}
            </CardTitle>
            <Link href="/admin/products?tab=sold_out" className="text-xs md:text-sm text-primary hover:underline whitespace-nowrap">
              {locale === 'el' ? 'Προβολή Όλων' : 'View All'}
            </Link>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {stats.soldOutProducts.length > 0 ? (
              <div className="space-y-2">
                {stats.soldOutProducts.map((product: any) => (
                  <p key={product.id} className="text-xs md:text-sm truncate">
                    {locale === 'el' ? product.name_el : product.name_en}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4 text-sm">
                {locale === 'el' ? 'Δεν υπάρχουν εξαντλημένα προϊόντα' : 'No sold out products'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
