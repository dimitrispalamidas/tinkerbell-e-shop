"use client"

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
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
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  
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
      toast.error(t('failed_fetch_product'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async (productId: string) => {
    if (!confirm(t('confirm_archive'))) return;
    
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
      toast.success(t('product_archived'));
      fetchProducts();
    } catch (error) {
      console.error('Error archiving product:', error);
      toast.error(t('failed_archive'));
    }
  };

  const handleRestore = async (productId: string) => {
    if (!confirm(t('confirm_unarchive'))) return;
    
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
      toast.success(t('product_unarchived'));
      fetchProducts();
    } catch (error) {
      console.error('Error restoring product:', error);
      toast.error(t('failed_unarchive'));
    }
  };

  const filteredProducts = products.filter(p => p.status === activeTab);

  const getTabCount = (status: TabType) => {
    return products.filter(p => p.status === status).length;
  };

  const tabs = [
    { 
      id: 'active' as TabType, 
      label: t('active_tab'), 
      icon: PackageCheck,
      color: 'text-green-600'
    },
    { 
      id: 'archived' as TabType, 
      label: t('archived_tab'), 
      icon: Archive,
      color: 'text-gray-600'
    },
    { 
      id: 'sold_out' as TabType, 
      label: t('sold_out_tab'), 
      icon: RotateCcw,
      color: 'text-orange-600'
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t('products_title')}</h1>
            <p className="text-muted-foreground">{tCommon('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t('products_title')}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{t('products_subtitle')}</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {t('add_product_btn')}
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b overflow-x-auto">
        <nav className="flex gap-2 md:gap-4 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = getTabCount(tab.id);
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 border-b-2 font-medium transition-colors text-sm md:text-base
                  ${isActive 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`h-4 w-4 md:h-5 md:w-5 ${isActive ? tab.color : ''}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
                <span className={`
                  px-2 py-0.5 rounded-full text-xs
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
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    {/* Image */}
                    <div className="w-full sm:w-16 md:w-20 h-16 md:h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {product.images && product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={locale === 'el' ? product.name_el : product.name_en}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          {t('no_image')}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Product Info */}
                      <div>
                        <h3 className="font-semibold text-sm md:text-base truncate">{locale === 'el' ? product.name_el : product.name_en}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                          {t('sku')}: {product.sku}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {t('stock')}: {totalStock} • {t('sold')}: {totalSold}
                        </p>
                      </div>

                      {/* Price & Status & Actions Row */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {/* Price & Status */}
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-base md:text-lg">{formatPrice(product.price, locale)}</p>
                          <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                            product.status === 'active' ? 'bg-green-100 text-green-700' :
                            product.status === 'archived' ? 'bg-gray-100 text-gray-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {product.status === 'active' ? t('active') :
                             product.status === 'archived' ? t('archived') :
                             t('sold_out')}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Link href={`/admin/products/${product.id}`}>
                            <Button variant="outline" size="sm" title={tCommon('edit')} className="h-8 w-8 p-0">
                              <Pencil className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </Button>
                          </Link>
                          
                          {activeTab === 'active' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleArchive(product.id)}
                              title={t('archive')}
                              className="h-8 w-8 p-0"
                            >
                              <Archive className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </Button>
                          )}
                          
                          {(activeTab === 'archived' || activeTab === 'sold_out') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRestore(product.id)}
                              title={t('unarchive')}
                              className="h-8 w-8 p-0"
                            >
                              <RotateCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 md:p-12 text-center">
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              {t('no_products')}
            </p>
            {activeTab === 'active' && (
              <Link href="/admin/products/new">
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('add_product_btn')}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
