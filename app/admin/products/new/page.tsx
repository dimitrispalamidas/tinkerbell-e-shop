"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { VariantManager, type Variant } from '@/components/admin/variant-manager';

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    sku: '',
    name_el: '',
    name_en: '',
    description_el: '',
    description_en: '',
    price: '',
    category_id: '',
    sizes: '',
    colors: '',
    is_active: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('type')
        .order('name_el');
      
      if (data) setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const supabase = createClient();
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setImageUrls([...imageUrls, ...uploadedUrls]);
      toast.success(`Uploaded ${uploadedUrls.length} image(s)`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();

      // Calculate total stock from variants
      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
      const productStatus = totalStock > 0 ? 'active' : 'sold_out';

      // Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          sku: formData.sku,
          name_el: formData.name_el,
          name_en: formData.name_en,
          description_el: formData.description_el || null,
          description_en: formData.description_en || null,
          price: parseFloat(formData.price),
          category_id: formData.category_id || null,
          sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : [],
          colors: formData.colors ? formData.colors.split(',').map(c => c.trim()) : [],
          is_active: formData.is_active && totalStock > 0,
          status: productStatus,
          images: imageUrls,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Create variants if any
      if (variants.length > 0 && product) {
        // Remove duplicates before inserting
        const uniqueVariants = variants.reduce((acc: Variant[], curr) => {
          const exists = acc.some(v => v.size === curr.size && v.color === curr.color);
          if (!exists) {
            acc.push(curr);
          }
          return acc;
        }, []);

        const variantData = uniqueVariants.map(v => ({
          product_id: product.id,
          size: v.size,
          color: v.color,
          stock: v.stock,
        }));

        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantData);

        if (variantError) throw variantError;
      }

      toast.success('Το προϊόν δημιουργήθηκε επιτυχώς!');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Product creation error:', error);
      
      // User-friendly error messages
      if (error.code === '23505') {
        if (error.message.includes('products_sku_key')) {
          toast.error('Το SKU υπάρχει ήδη! Χρησιμοποίησε διαφορετικό.');
        } else if (error.message.includes('product_variants')) {
          toast.error('Υπάρχει duplicate variant (size/color combination).');
        } else {
          toast.error('Το στοιχείο υπάρχει ήδη.');
        }
      } else {
        toast.error(error.message || 'Αποτυχία δημιουργίας προϊόντος');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Προσθήκη Προϊόντος</h1>
          <p className="text-muted-foreground">Δημιουργία νέου προϊόντος</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Βασικές Πληροφορίες</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Κωδικός Προϊόντος (SKU) *</label>
                <div className="flex gap-2">
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    placeholder="PROD-001"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      const supabase = createClient();
                      // Get all products with PROD- prefix
                      const { data } = await supabase
                        .from('products')
                        .select('sku')
                        .like('sku', 'PROD-%')
                        .order('sku', { ascending: false });
                      
                      let maxNum = 0;
                      if (data && data.length > 0) {
                        // Find the highest number
                        data.forEach(p => {
                          const match = p.sku.match(/PROD-(\d+)/);
                          if (match) {
                            maxNum = Math.max(maxNum, parseInt(match[1]));
                          }
                        });
                      }
                      
                      const newNum = (maxNum + 1).toString().padStart(3, '0');
                      setFormData({ ...formData, sku: `PROD-${newNum}` });
                    }}
                  >
                    Auto
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Κατηγορία</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Χωρίς κατηγορία</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name_el} ({cat.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Τιμή (EUR) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  placeholder="29.99"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ελληνικά</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Όνομα *</label>
                <Input
                  value={formData.name_el}
                  onChange={(e) => setFormData({ ...formData, name_el: e.target.value })}
                  required
                  placeholder="Όνομα προϊόντος"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Περιγραφή</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  value={formData.description_el}
                  onChange={(e) => setFormData({ ...formData, description_el: e.target.value })}
                  placeholder="Περιγραφή προϊόντος"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Αγγλικά</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Όνομα *</label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  required
                  placeholder="Product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Περιγραφή</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="Product description"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Παραλλαγές</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Μεγέθη (χωρισμένα με κόμμα)</label>
                <Input
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  placeholder="4Y, 6Y, 8Y, 10Y, 12Y"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Εισάγετε μεγέθη χωρισμένα με κόμμα
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Χρώματα (χωρισμένα με κόμμα)</label>
                <Input
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                  placeholder="Ροζ, Μπλε, Πράσινο"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Εισάγετε χρώματα χωρισμένα με κόμμα
                </p>
              </div>
            </CardContent>
          </Card>

          <VariantManager
            sizes={formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(s => s) : []}
            colors={formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(c => c) : []}
            variants={variants}
            onChange={setVariants}
          />

          <Card>
            <CardHeader>
              <CardTitle>Εικόνες Προϊόντος</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">
                      {uploadingImages ? 'Φόρτωση...' : 'Κλικ για ανέβασμα εικόνων'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP έως 5MB η καθεμία
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                    className="hidden"
                  />
                </label>
              </div>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square group">
                      <Image
                        src={url}
                        alt={`Product image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Κύρια
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">Το προϊόν είναι ενεργό</span>
              </label>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Link href="/admin/products" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Ακύρωση
              </Button>
            </Link>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Δημιουργία...' : 'Δημιουργία Προϊόντος'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

