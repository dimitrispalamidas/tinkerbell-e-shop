"use client"

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Translations
const translations = {
  el: {
    analytics_title: 'Πωλήσεις',
    analytics_subtitle: 'Ανάλυση πωλήσεων και απόδοσης καταστήματος',
    period_today: 'Σήμερα',
    period_week: 'Εβδομάδα',
    period_month: 'Μήνας',
    period_year: 'Έτος',
    period_all: 'Όλα',
    total_revenue: 'Συνολικά Έσοδα',
    total_orders: 'Συνολικές Παραγγελίες',
    products_sold: 'Προϊόντα που Πωλήθηκαν',
    avg_order_value: 'Μέση Αξία Παραγγελίας',
    from_previous_period: 'από προηγούμενη περίοδο',
    revenue_trend: 'Τάση Εσόδων',
    orders_trend: 'Τάση Παραγγελιών',
    top_products: 'Κορυφαία Προϊόντα',
    sold: 'πωλήθηκαν',
    category_performance: 'Απόδοση Κατηγοριών',
    no_sales_data: 'Δεν υπάρχουν δεδομένα πωλήσεων',
    no_category_data: 'Δεν υπάρχουν δεδομένα κατηγοριών',
    loading: 'Φόρτωση...'
  },
  en: {
    analytics_title: 'Sales',
    analytics_subtitle: 'Sales analysis and store performance',
    period_today: 'Today',
    period_week: 'Week',
    period_month: 'Month',
    period_year: 'Year',
    period_all: 'All Time',
    total_revenue: 'Total Revenue',
    total_orders: 'Total Orders',
    products_sold: 'Products Sold',
    avg_order_value: 'Average Order Value',
    from_previous_period: 'from previous period',
    revenue_trend: 'Revenue Trend',
    orders_trend: 'Orders Trend',
    top_products: 'Top Products',
    sold: 'sold',
    category_performance: 'Category Performance',
    no_sales_data: 'No sales data available',
    no_category_data: 'No category data available',
    loading: 'Loading...'
  }
};

type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'all';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProductsSold: number;
  avgOrderValue: number;
  revenueChange: number;
  ordersChange: number;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  topProducts: Array<{ name: string; sold: number; revenue: number }>;
  categoryPerformance: Array<{ name: string; value: number }>;
}

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export default function AnalyticsPage() {
  const locale = useLocale() as 'el' | 'en';
  const t = translations[locale];
  
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProductsSold: 0,
    avgOrderValue: 0,
    revenueChange: 0,
    ordersChange: 0,
    revenueByDay: [],
    topProducts: [],
    categoryPerformance: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timePeriod]);

  const getDateRange = (): { startDate: Date; endDate: Date; prevStartDate: Date } => {
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);
    let prevStartDate = new Date(now);

    switch (timePeriod) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        prevStartDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        prevStartDate.setDate(startDate.getDate() - 30);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        prevStartDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date('2020-01-01');
        prevStartDate = new Date('2020-01-01');
        break;
    }

    return { startDate, endDate, prevStartDate };
  };

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { startDate, endDate, prevStartDate } = getDateRange();

      // Fetch orders for current period
      const { data: orders } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('payment_status', 'paid');

      // Fetch orders for previous period (for comparison)
      const { data: prevOrders } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', prevStartDate.toISOString())
        .lt('created_at', startDate.toISOString())
        .eq('payment_status', 'paid');

      // Calculate metrics
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const totalOrders = orders?.length || 0;
      const totalProductsSold = orders?.reduce((sum, order) => 
        sum + order.order_items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
      ) || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate changes
      const prevRevenue = prevOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const prevOrdersCount = prevOrders?.length || 0;
      const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
      const ordersChange = prevOrdersCount > 0 ? ((totalOrders - prevOrdersCount) / prevOrdersCount) * 100 : 0;

      // Group revenue by day
      const revenueByDay = orders?.reduce((acc: any[], order) => {
        const date = new Date(order.created_at).toLocaleDateString(locale === 'el' ? 'el-GR' : 'en-US', {
          month: 'short',
          day: 'numeric'
        });
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.revenue += Number(order.total);
          existing.orders += 1;
        } else {
          acc.push({ date, revenue: Number(order.total), orders: 1 });
        }
        return acc;
      }, []) || [];

      // Fetch products with sold count
      const { data: products } = await supabase
        .from('products')
        .select('id, name_el, name_en, price, product_variants(sold_count)');

      // Calculate top products
      const topProducts = products?.map(product => {
        const totalSold = product.product_variants?.reduce(
          (sum: number, variant: any) => sum + (variant.sold_count || 0), 0
        ) || 0;
        return {
          name: locale === 'el' ? product.name_el : product.name_en,
          sold: totalSold,
          revenue: totalSold * product.price
        };
      })
      .filter(p => p.sold > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5) || [];

      // Fetch categories performance
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name_el, name_en');

      const categoryPerformance = await Promise.all(
        categories?.map(async (category) => {
          const { data: catProducts } = await supabase
            .from('products')
            .select('id, product_variants(sold_count)')
            .eq('category_id', category.id);

          const totalSold = catProducts?.reduce((sum, product) => 
            sum + (product.product_variants?.reduce(
              (vSum: number, variant: any) => vSum + (variant.sold_count || 0), 0
            ) || 0), 0
          ) || 0;

          return {
            name: locale === 'el' ? category.name_el : category.name_en,
            value: totalSold
          };
        }) || []
      );

      setAnalytics({
        totalRevenue,
        totalOrders,
        totalProductsSold,
        avgOrderValue,
        revenueChange,
        ordersChange,
        revenueByDay,
        topProducts,
        categoryPerformance: categoryPerformance.filter(c => c.value > 0)
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    format = 'number' 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    change?: number; 
    format?: 'number' | 'currency' 
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {format === 'currency' ? formatPrice(value, locale) : value.toLocaleString()}
        </div>
        {change !== undefined && (
          <p className={`text-xs flex items-center gap-1 mt-1 ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(change).toFixed(1)}% {t.from_previous_period}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t.analytics_title}</h1>
          <p className="text-muted-foreground">{t.analytics_subtitle}</p>
        </div>

        {/* Time Period Selector */}
        <div className="flex gap-2 flex-wrap">
          {(['today', 'week', 'month', 'year', 'all'] as TimePeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timePeriod === period
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {t[`period_${period}` as keyof typeof t]}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t.total_revenue}
          value={analytics.totalRevenue}
          icon={DollarSign}
          change={analytics.revenueChange}
          format="currency"
        />
        <StatCard
          title={t.total_orders}
          value={analytics.totalOrders}
          icon={ShoppingCart}
          change={analytics.ordersChange}
        />
        <StatCard
          title={t.products_sold}
          value={analytics.totalProductsSold}
          icon={Package}
        />
        <StatCard
          title={t.avg_order_value}
          value={analytics.avgOrderValue}
          icon={TrendingUp}
          format="currency"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t.revenue_trend}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => formatPrice(value, locale)}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {t.orders_trend}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="orders" 
                  fill="#ec4899" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t.top_products}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topProducts.length > 0 ? (
              <div className="space-y-4">
                {analytics.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.sold} {t.sold}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm">
                      {formatPrice(product.revenue, locale)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {t.no_sales_data}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t.category_performance}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.categoryPerformance.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics.categoryPerformance}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {analytics.categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: string) => [value, name]}
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Custom Legend */}
                <div className="grid grid-cols-1 gap-2 px-4">
                  {analytics.categoryPerformance.map((entry, index) => {
                    const total = analytics.categoryPerformance.reduce((sum, item) => sum + item.value, 0);
                    const percentage = ((entry.value / total) * 100).toFixed(0);
                    return (
                      <div key={index} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm text-muted-foreground truncate">
                            {entry.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold whitespace-nowrap">
                          {percentage}% ({entry.value})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {t.no_category_data}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

