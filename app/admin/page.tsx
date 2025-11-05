"use client"

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  
  const [stats, setStats] = useState<{
    products: any[];
    orders: any[];
    todaySales: number;
    soldOutProducts: any[];
    topSellingProducts: any[];
  }>({
    products: [],
    orders: [],
    todaySales: 0,
    soldOutProducts: [],
    topSellingProducts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const supabase = createClient();

      // Get statistics
      const { data: products } = await supabase
        .from('products')
        .select('*', { count: 'exact' });

      const { data: orders } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: todayOrders } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', new Date().toISOString().split('T')[0]);

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
        topSellingProducts
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{tCommon('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard_title')}</h1>
        <p className="text-muted-foreground">{t('dashboard_subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_products')}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_orders')}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('sales_today')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.todaySales, locale)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('sold_out_products')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.soldOutProducts.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('recent_orders')}</CardTitle>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">
            {t('view_all')}
          </Link>
        </CardHeader>
        <CardContent>
          {stats.orders.length > 0 ? (
            <div className="space-y-4">
              {stats.orders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(order.total, locale)}</p>
                    <p className={`text-xs ${
                      order.status === 'delivered' ? 'text-green-600' :
                      order.status === 'cancelled' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {t(order.status)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">{t('no_orders')}</p>
          )}
        </CardContent>
      </Card>

      {/* Top Selling & Sold Out Products */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Selling */}
        <Card>
          <CardHeader>
            <CardTitle>{t('top_selling')}</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topSellingProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.topSellingProducts.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <p className="text-sm truncate">{locale === 'el' ? product.name_el : product.name_en}</p>
                    <span className="text-sm font-medium">{product.totalSold} {t('sold')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">{t('no_top_selling')}</p>
            )}
          </CardContent>
        </Card>

        {/* Sold Out Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('sold_out_products')}</CardTitle>
            <Link href="/admin/products?tab=sold_out" className="text-sm text-primary hover:underline">
              {t('view_all')}
            </Link>
          </CardHeader>
          <CardContent>
            {stats.soldOutProducts.length > 0 ? (
              <div className="space-y-2">
                {stats.soldOutProducts.map((product: any) => (
                  <p key={product.id} className="text-sm truncate">
                    {locale === 'el' ? product.name_el : product.name_en}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">{t('no_sold_out')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
