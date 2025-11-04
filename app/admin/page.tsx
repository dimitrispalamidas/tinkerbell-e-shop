import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = await createClient();

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

  // Get sold out products (status = 'sold_out')
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Πίνακας Ελέγχου</h1>
        <p className="text-muted-foreground">Επισκόπηση του καταστήματος</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Σύνολο Προϊόντων</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Σύνολο Παραγγελιών</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Πωλήσεις Σήμερα</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(todaySales, 'el')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Πωληθέντα</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soldOutProducts?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Πρόσφατες Παραγγελίες</CardTitle>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between p-3 hover:bg-accent rounded-lg transition-colors"
                  >
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('el-GR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(order.total, 'el')}</p>
                      <p className="text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'paid' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status === 'paid' ? 'Πληρωμένη' :
                           order.status === 'pending' ? 'Εκκρεμής' :
                           order.status === 'shipped' ? 'Απεσταλμένη' :
                           order.status === 'delivered' ? 'Παραδομένη' : 'Ακυρωμένη'}
                        </span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Δεν υπάρχουν παραγγελίες ακόμα</p>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Δημοφιλέστερα Προϊόντα</CardTitle>
          </CardHeader>
          <CardContent>
            {topSellingProducts && topSellingProducts.length > 0 ? (
              <div className="space-y-4">
                {topSellingProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/admin/products/${product.id}`}
                    className="flex items-center justify-between p-3 hover:bg-accent rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name_el}</p>
                        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{product.totalSold}</p>
                      <p className="text-xs text-muted-foreground">πωλήσεις</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Δεν υπάρχουν πωλήσεις ακόμα</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

