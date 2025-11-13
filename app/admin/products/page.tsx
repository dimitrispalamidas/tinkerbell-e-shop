"use client"

import { useState, useEffect, useMemo } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Archive, PackageCheck, RotateCcw } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { toast } from 'sonner';
import { SearchInput } from '@/components/ui/search-input';

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
  const locale = useLocale();
  
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/products', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(locale === 'el' ? 'Αποτυχία φόρτωσης προϊόντος' : 'Failed to fetch product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async (productId: string) => {
    if (!confirm(locale === 'el' ? 'Είστε σίγουροι ότι θέλετε να αρχειοθετήσετε αυτό το προϊόν;' : 'Are you sure you want to archive this product?')) return;
    
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'archive',
          productId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to archive product');
      }

      toast.success(locale === 'el' ? 'Το προϊόν αρχειοθετήθηκε' : 'Product archived');
      fetchProducts();
    } catch (error) {
      console.error('Error archiving product:', error);
      toast.error(locale === 'el' ? 'Αποτυχία αρχειοθέτησης' : 'Failed to archive');
    }
  };

  const handleRestore = async (productId: string) => {
    if (!confirm(locale === 'el' ? 'Είστε σίγουροι ότι θέλετε να επαναφέρετε αυτό το προϊόν;' : 'Are you sure you want to restore this product?')) return;
    
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'restore',
          productId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to restore product');
      }

      toast.success(locale === 'el' ? 'Το προϊόν επαναφέρθηκε' : 'Product restored');
      fetchProducts();
    } catch (error) {
      console.error('Error restoring product:', error);
      toast.error(locale === 'el' ? 'Αποτυχία επαναφοράς' : 'Failed to restore');
    }
  };

  const filteredProducts = useMemo(() => {
    // First filter by status
    let filtered = products.filter(p => p.status === activeTab);
    
    // Then apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => {
        const nameEl = (product.name_el || '').toLowerCase();
        const nameEn = (product.name_en || '').toLowerCase();
        const sku = (product.sku || '').toLowerCase();
        
        return nameEl.includes(query) ||
               nameEn.includes(query) ||
               sku.includes(query);
      });
    }
    
    return filtered;
  }, [products, activeTab, searchQuery]);

  const getTabCount = (status: TabType) => {
    return products.filter(p => p.status === status).length;
  };

  const tabs = [
    { 
      id: 'active' as TabType, 
      label: locale === 'el' ? 'Ενεργά' : 'Active', 
      icon: PackageCheck,
      color: 'text-green-600'
    },
    { 
      id: 'archived' as TabType, 
      label: locale === 'el' ? 'Αρχειοθετημένα' : 'Archived', 
      icon: Archive,
      color: 'text-gray-600'
    },
    { 
      id: 'sold_out' as TabType, 
      label: locale === 'el' ? 'Εξαντλημένα' : 'Sold Out', 
      icon: RotateCcw,
      color: 'text-orange-600'
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {locale === 'el' ? 'Προϊόντα' : 'Products'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'el' ? 'Φόρτωση...' : 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {locale === 'el' ? 'Προϊόντα' : 'Products'}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {locale === 'el' ? 'Διαχείριση καταλόγου προϊόντων' : 'Manage product catalog'}
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="w-full sm:w-auto h-11 md:h-10 text-sm md:text-base touch-manipulation">
            <Plus className="mr-2 h-4 w-4" />
            {locale === 'el' ? 'Προσθήκη Προϊόντος' : 'Add Product'}
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={locale === 'el' ? 'Αναζήτηση προϊόντων (όνομα, κωδικός)...' : 'Search products (name, SKU)...'}
      />

      {/* Tabs */}
      <div className="border-b overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <nav className="flex gap-1 md:gap-4 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = getTabCount(tab.id);
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-3 md:px-4 py-3 md:py-3 border-b-2 font-medium transition-colors text-sm md:text-base touch-manipulation
                  ${isActive 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`h-4 w-4 md:h-5 md:w-5 ${isActive ? tab.color : ''}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-semibold
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
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-4">
                  <div className="flex gap-3 md:gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 md:w-20 md:h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
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
                          {locale === 'el' ? 'Χωρίς εικόνα' : 'No image'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Product Info */}
                      <div>
                        <h3 className="font-semibold text-base md:text-base line-clamp-1">{locale === 'el' ? product.name_el : product.name_en}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                          {locale === 'el' ? 'Κωδικός' : 'SKU'}: {product.sku}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {locale === 'el' ? 'Απόθεμα' : 'Stock'}: {totalStock} • {locale === 'el' ? 'Πωλήθηκαν' : 'Sold'}: {totalSold}
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
                            {product.status === 'active' ? (locale === 'el' ? 'Ενεργό' : 'Active') :
                             product.status === 'archived' ? (locale === 'el' ? 'Αρχειοθετημένο' : 'Archived') :
                             (locale === 'el' ? 'Εξαντλημένο' : 'Sold Out')}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Link href={`/admin/products/${product.id}`}>
                            <Button variant="outline" size="sm" title={locale === 'el' ? 'Επεξεργασία' : 'Edit'} className="h-9 w-9 md:h-8 md:w-8 p-0 touch-manipulation">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {activeTab === 'active' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleArchive(product.id)}
                              title={locale === 'el' ? 'Αρχειοθέτηση' : 'Archive'}
                              className="h-9 w-9 md:h-8 md:w-8 p-0 touch-manipulation"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {(activeTab === 'archived' || activeTab === 'sold_out') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRestore(product.id)}
                              title={locale === 'el' ? 'Επαναφορά' : 'Unarchive'}
                              className="h-9 w-9 md:h-8 md:w-8 p-0 touch-manipulation"
                            >
                              <RotateCcw className="h-4 w-4" />
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
              {locale === 'el' ? 'Δεν υπάρχουν προϊόντα' : 'No products'}
            </p>
            {activeTab === 'active' && (
              <Link href="/admin/products/new">
                <Button className="w-full sm:w-auto h-11 md:h-10 text-sm md:text-base touch-manipulation">
                  <Plus className="mr-2 h-4 w-4" />
                  {locale === 'el' ? 'Προσθήκη Προϊόντος' : 'Add Product'}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
