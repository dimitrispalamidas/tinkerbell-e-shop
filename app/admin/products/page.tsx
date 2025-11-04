"use client"

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Archive, PackageCheck, RotateCcw } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { toast } from 'sonner';

type Product = {
  id: string;
  sku: string;
  name_el: string;
  name_en: string;
  price: number;
  images: string[];
  is_active: boolean;
  status: 'active' | 'archived' | 'sold_out';
  categories: any;
  product_variants: Array<{
    id: string;
    stock: number;
    sold_count: number;
  }>;
};

type TabType = 'active' | 'archived' | 'sold_out';

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*), product_variants(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Σφάλμα φόρτωσης προϊόντων');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async (productId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('products')
        .update({ 
          status: 'archived',
          archived_at: new Date().toISOString(),
          is_active: false
        })
        .eq('id', productId);

      if (error) throw error;
      toast.success('Το προϊόν αρχειοθετήθηκε επιτυχώς!');
      fetchProducts();
    } catch (error) {
      console.error('Error archiving product:', error);
      toast.error('Σφάλμα αρχειοθέτησης');
    }
  };

  const handleRestore = async (productId: string) => {
    try {
      const supabase = createClient();
      
      // Check if product has stock
      const { data: variants } = await supabase
        .from('product_variants')
        .select('stock')
        .eq('product_id', productId);

      const totalStock = variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
      const newStatus = totalStock > 0 ? 'active' : 'sold_out';

      const { error } = await supabase
        .from('products')
        .update({ 
          status: newStatus,
          is_active: newStatus === 'active',
          archived_at: null
        })
        .eq('id', productId);

      if (error) throw error;
      toast.success(`Το προϊόν επαναφέρθηκε${newStatus === 'active' ? ' και είναι ενεργό' : ' αλλά χρειάζεται stock'}!`);
      fetchProducts();
    } catch (error) {
      console.error('Error restoring product:', error);
      toast.error('Σφάλμα επαναφοράς');
    }
  };

  const filteredProducts = products.filter(p => p.status === activeTab);

  const getTabCount = (status: TabType) => {
    return products.filter(p => p.status === status).length;
  };

  const tabs = [
    { 
      id: 'active' as TabType, 
      label: 'Προς Πώληση', 
      icon: PackageCheck,
      color: 'text-green-600'
    },
    { 
      id: 'archived' as TabType, 
      label: 'Αρχειοθετημένα', 
      icon: Archive,
      color: 'text-gray-600'
    },
    { 
      id: 'sold_out' as TabType, 
      label: 'Πωληθέντα', 
      icon: RotateCcw,
      color: 'text-orange-600'
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Προϊόντα</h1>
            <p className="text-muted-foreground">Φόρτωση...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Προϊόντα</h1>
          <p className="text-muted-foreground">Διαχείριση καταλόγου προϊόντων</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Προσθήκη Προϊόντος
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = getTabCount(tab.id);
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors
                  ${isActive 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? tab.color : ''}`} />
                {tab.label}
                <span className={`
                  ml-1 px-2 py-0.5 rounded-full text-xs
                  ${isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid gap-4">
          {filteredProducts.map((product) => {
            const totalStock = product.product_variants?.reduce(
              (sum, variant) => sum + (variant.stock || 0),
              0
            ) || 0;

            const totalSold = product.product_variants?.reduce(
              (sum, variant) => sum + (variant.sold_count || 0),
              0
            ) || 0;
            
            return (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4 items-center">
                    {/* Image */}
                    <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {product.images && product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name_el}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{product.name_el}</h3>
                      <p className="text-sm text-muted-foreground">
                        SKU: {product.sku} • Stock: {totalStock} • Πωλήθηκαν: {totalSold}
                      </p>
                      <p className="text-sm text-muted-foreground">{product.name_en}</p>
                    </div>

                    {/* Price & Status */}
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatPrice(product.price, 'el')}</p>
                      <p className="text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.status === 'active' ? 'bg-green-100 text-green-700' :
                          product.status === 'archived' ? 'bg-gray-100 text-gray-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {product.status === 'active' ? 'Ενεργό' :
                           product.status === 'archived' ? 'Αρχειοθετημένο' :
                           'Πωλήθηκε'}
                        </span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/admin/products/${product.id}`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      {activeTab === 'active' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleArchive(product.id)}
                          title="Αρχειοθέτηση"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {(activeTab === 'archived' || activeTab === 'sold_out') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRestore(product.id)}
                          title={activeTab === 'sold_out' ? 'Επεξεργασία για Restock' : 'Επαναφορά'}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              {activeTab === 'active' && 'Δεν υπάρχουν ενεργά προϊόντα'}
              {activeTab === 'archived' && 'Δεν υπάρχουν αρχειοθετημένα προϊόντα'}
              {activeTab === 'sold_out' && 'Δεν υπάρχουν πωληθέντα προϊόντα'}
            </p>
            {activeTab === 'active' && (
              <Link href="/admin/products/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Προσθήκη Πρώτου Προϊόντος
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
