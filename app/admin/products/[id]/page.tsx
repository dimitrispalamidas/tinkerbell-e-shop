"use client"

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Upload, X, Languages } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { VariantManager, type Variant } from '@/components/admin/variant-manager';
import { translateText } from '@/lib/utils/translate';
import { Color } from '@/lib/types/database';
import { updateProduct } from '@/lib/actions/update-product';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const locale = useLocale();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [translating, setTranslating] = useState({ name: false, description: false });
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
  });
  
  // Store original data for comparison
  const [originalData, setOriginalData] = useState({
    formData: {
      sku: '',
      name_el: '',
      name_en: '',
      description_el: '',
      description_en: '',
      price: '',
      category_id: '',
      sizes: '',
      colors: '',
    },
    imageUrls: [] as string[],
    variants: [] as Variant[],
  });

  useEffect(() => {
    fetchCategories();
    fetchColors();
    fetchProduct();
  }, [productId]);

  const fetchColors = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('colors')
        .select('*')
        .eq('is_active', true)
        .order('name_el');
      
      if (data) setColors(data);
    } catch (error) {
      console.error('Failed to fetch colors');
    }
  };

  const handleColorToggle = (colorName: string) => {
    setSelectedColors(prev => 
      prev.includes(colorName)
        ? prev.filter(c => c !== colorName)
        : [...prev, colorName]
    );
  };

  // Check if there are any changes
  const hasChanges = useMemo(() => {
    // Compare form data
    const formChanged = JSON.stringify(formData) !== JSON.stringify(originalData.formData);
    
    // Compare images
    const imagesChanged = JSON.stringify(imageUrls) !== JSON.stringify(originalData.imageUrls);
    
    // Compare variants
    const variantsChanged = JSON.stringify(variants) !== JSON.stringify(originalData.variants);
    
    return formChanged || imagesChanged || variantsChanged;
  }, [formData, imageUrls, variants, originalData]);

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

  const handleTranslateName = async () => {
    if (!formData.name_el) {
      toast.error(locale === 'el' ? 'Παρακαλώ συμπληρώστε πρώτα το ελληνικό όνομα' : 'Please fill in the Greek name first');
      return;
    }

    setTranslating({ ...translating, name: true });
    try {
      const translated = await translateText(formData.name_el, 'el', 'en');
      setFormData({ ...formData, name_en: translated });
      toast.success(locale === 'el' ? 'Μεταφράστηκε επιτυχώς!' : 'Translated successfully!');
    } catch (error) {
      toast.error(locale === 'el' ? 'Αποτυχία μετάφρασης' : 'Translation failed');
    } finally {
      setTranslating({ ...translating, name: false });
    }
  };

  const handleTranslateDescription = async () => {
    if (!formData.description_el) {
      toast.error(locale === 'el' ? 'Παρακαλώ συμπληρώστε πρώτα την ελληνική περιγραφή' : 'Please fill in the Greek description first');
      return;
    }

    setTranslating({ ...translating, description: true });
    try {
      const translated = await translateText(formData.description_el, 'el', 'en');
      setFormData({ ...formData, description_en: translated });
      toast.success(locale === 'el' ? 'Μεταφράστηκε επιτυχώς!' : 'Translated successfully!');
    } catch (error) {
      toast.error(locale === 'el' ? 'Αποτυχία μετάφρασης' : 'Translation failed');
    } finally {
      setTranslating({ ...translating, description: false });
    }
  };

  const fetchProduct = async () => {
    try {
      const supabase = createClient();
      
      // Fetch product
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      if (data) {
        const productFormData = {
          sku: data.sku,
          name_el: data.name_el,
          name_en: data.name_en,
          description_el: data.description_el || '',
          description_en: data.description_en || '',
          price: data.price.toString(),
          category_id: data.category_id || '',
          sizes: data.sizes?.join(', ') || '',
          colors: data.colors?.join(', ') || '',
        };
        const productImages = data.images || [];
        const productColors = data.colors || [];
        
        setFormData(productFormData);
        setImageUrls(productImages);
        setSelectedColors(productColors);
        
        // Fetch variants
        const { data: variantsData, error: variantsError } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', productId)
          .order('size')
          .order('color');

        const productVariants = !variantsError && variantsData 
          ? variantsData.map(v => ({
              size: v.size,
              color: v.color,
              stock: v.stock,
            }))
          : [];
        
        setVariants(productVariants);
        
        // Store original data
        setOriginalData({
          formData: productFormData,
          imageUrls: productImages,
          variants: productVariants,
        });
      }
    } catch (error: any) {
      toast.error(error.message || (locale === 'el' ? 'Αποτυχία φόρτωσης προϊόντος' : 'Failed to fetch product'));
      router.push('/admin/products');
    } finally {
      setIsFetching(false);
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
      toast.success(locale === 'el' ? `Ανέβηκαν ${uploadedUrls.length} εικόνες` : `Uploaded ${uploadedUrls.length} images`);
    } catch (error: any) {
      toast.error(error.message || (locale === 'el' ? 'Αποτυχία ανεβάσματος' : 'Upload failed'));
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = imageUrls[index];
    
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      if (fileName) {
        const supabase = createClient();
        const { error } = await supabase.storage
          .from('products')
          .remove([fileName]);
        
        if (error) {
          console.error('Error deleting image from storage:', error);
          toast.error(locale === 'el' ? 'Αποτυχία διαγραφής εικόνας' : 'Failed to delete image');
          return;
        }
      }
      
      // Remove from state
      setImageUrls(imageUrls.filter((_, i) => i !== index));
      toast.success(locale === 'el' ? 'Η εικόνα διαγράφηκε' : 'Image deleted');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error(locale === 'el' ? 'Αποτυχία διαγραφής εικόνας' : 'Failed to delete image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ✅ Use server action with cache revalidation
      const { success } = await updateProduct(productId, {
        sku: formData.sku,
        name_el: formData.name_el,
        name_en: formData.name_en,
        description_el: formData.description_el || null,
        description_en: formData.description_en || null,
        price: formData.price,
        category_id: formData.category_id || null,
        sizes: formData.sizes,
        colors: selectedColors,
        is_active: formData.is_active,
        images: imageUrls,
        variants: variants,
      });

      if (!success) throw new Error('Failed to update product');

      toast.success(locale === 'el' ? 'Το προϊόν ενημερώθηκε' : 'Product updated');
      router.push('/admin/products');
      router.refresh(); // Extra refresh for admin page
    } catch (error: any) {
      console.error('Product update error:', error);
      
      if (error.code === '23505') {
        if (error.message.includes('products_sku_key')) {
          toast.error(locale === 'el' ? 'Το SKU υπάρχει ήδη' : 'SKU already exists');
        } else if (error.message.includes('product_variants')) {
          toast.error(locale === 'el' ? 'Διπλότυπη παραλλαγή' : 'Duplicate variant');
        } else {
          toast.error(locale === 'el' ? 'Το προϊόν υπάρχει ήδη' : 'Product already exists');
        }
      } else {
        toast.error(error.message || (locale === 'el' ? 'Αποτυχία ενημέρωσης προϊόντος' : 'Failed to update product'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Φόρτωση προϊόντος...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{locale === 'el' ? 'Επεξεργασία Προϊόντος' : 'Edit Product'}</h1>
          <p className="text-muted-foreground">{locale === 'el' ? 'Ενημέρωση πληροφοριών προϊόντος' : 'Update product information'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'el' ? 'Πληροφορίες Προϊόντος' : 'Product Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{locale === 'el' ? 'Κατηγορία' : 'Category'}</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">{locale === 'el' ? 'Χωρίς κατηγορία' : 'No category'}</option>
                  <optgroup label={locale === 'el' ? '👕 Ρούχα' : '👕 Clothing'}>
                    {categories.filter(cat => cat.type === 'clothing').map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {locale === 'el' ? cat.name_el : cat.name_en}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={locale === 'el' ? '👟 Παπούτσια' : '👟 Shoes'}>
                    {categories.filter(cat => cat.type === 'shoes').map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {locale === 'el' ? cat.name_el : cat.name_en}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{locale === 'el' ? 'Κωδικός Προϊόντος (SKU) *' : 'Product SKU *'}</label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                  placeholder="PROD-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{locale === 'el' ? 'Τιμή *' : 'Price *'}</label>
                <Input
                  type="text"
                  value={formData.price}
                  onChange={(e) => {
                    // Allow digits, comma, and dot
                    const value = e.target.value.replace(/[^\d.,]/g, '');
                    setFormData({ ...formData, price: value });
                  }}
                  onBlur={(e) => {
                    // Format on blur - convert comma to dot
                    const value = e.target.value.replace(',', '.');
                    const num = parseFloat(value);
                    if (!isNaN(num)) {
                      setFormData({ ...formData, price: num.toFixed(2) });
                    }
                  }}
                  required
                  placeholder={locale === 'el' ? 'π.χ. 9.99 ή 10' : 'e.g. 9.99 or 10'}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{locale === 'el' ? 'Ελληνικά' : 'Greek'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{locale === 'el' ? 'Όνομα (Ελληνικά) *' : 'Name (Greek) *'}</label>
                <Input
                  value={formData.name_el}
                  onChange={(e) => setFormData({ ...formData, name_el: e.target.value })}
                  required
                  placeholder="Όνομα προϊόντος"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{locale === 'el' ? 'Περιγραφή (Ελληνικά)' : 'Description (Greek)'}</label>
                <Textarea
                  value={formData.description_el}
                  onChange={(e) => setFormData({ ...formData, description_el: e.target.value })}
                  placeholder="Περιγραφή προϊόντος"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{locale === 'el' ? 'Αγγλικά' : 'English'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{locale === 'el' ? 'Όνομα (Αγγλικά) *' : 'Name (English) *'}</label>
                <div className="flex gap-2">
                  <Input
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    required
                    placeholder="Product name"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleTranslateName}
                    disabled={translating.name || !formData.name_el}
                    title={locale === 'el' ? 'Αυτόματη μετάφραση' : 'Auto translate'}
                  >
                    <Languages className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{locale === 'el' ? 'Περιγραφή (Αγγλικά)' : 'Description (English)'}</label>
                <div className="flex gap-2 items-start">
                  <Textarea
                    className="flex-1"
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    placeholder="Product description"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleTranslateDescription}
                    disabled={translating.description || !formData.description_el}
                    title={locale === 'el' ? 'Αυτόματη μετάφραση' : 'Auto translate'}
                  >
                    <Languages className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{locale === 'el' ? 'Διαθέσιμες Επιλογές' : 'Available Options'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{locale === 'el' ? 'Μεγέθη' : 'Sizes'}</label>
                <Input
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  placeholder="4Y, 6Y, 8Y, 10Y, 12Y"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {locale === 'el' ? 'Χωρίστε με κόμμα (π.χ. S, M, L, XL)' : 'Comma separated (e.g. S, M, L, XL)'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{locale === 'el' ? 'Χρώματα' : 'Colors'}</label>
                {colors.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border rounded-lg p-4 max-h-[300px] overflow-y-auto">
                    {colors.map((color) => (
                      <div key={color.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`color-${color.id}`}
                          checked={selectedColors.includes(color.name_el)}
                          onCheckedChange={() => handleColorToggle(color.name_el)}
                        />
                        <div 
                          className="w-5 h-5 rounded border-2 border-gray-200 flex-shrink-0"
                          style={{ backgroundColor: color.hex_value }}
                        />
                        <Label
                          htmlFor={`color-${color.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {locale === 'el' ? color.name_el : color.name_en}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {locale === 'el' ? 'Δεν υπάρχουν διαθέσιμα χρώματα. Προσθέστε χρώματα από τη σελίδα Χρώματα.' : 'No colors available. Add colors from the Colors page.'}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {locale === 'el' ? `Επιλεγμένα: ${selectedColors.length}` : `Selected: ${selectedColors.length}`}
                </p>
              </div>
            </CardContent>
          </Card>

          <VariantManager
            sizes={formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(s => s) : []}
            colors={selectedColors}
            variants={variants}
            onChange={setVariants}
          />

          <Card>
            <CardHeader>
              <CardTitle>{locale === 'el' ? 'Εικόνες Προϊόντος' : 'Product Images'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">
                      {uploadingImages ? (locale === 'el' ? 'Ανέβασμα...' : 'Uploading...') : (locale === 'el' ? 'Κλικ για ανέβασμα' : 'Click to upload')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {locale === 'el' ? 'PNG, JPG, WEBP έως 5MB το κάθε ένα. Επιλέξτε πολλές εικόνες ή χρησιμοποιήστε την κάμερα.' : 'PNG, JPG, WEBP up to 5MB each. Select multiple images or use camera.'}
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
                <div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {locale === 'el' ? 'Σύρετε τις εικόνες για να αλλάξετε τη σειρά' : 'Drag images to reorder'}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imageUrls.map((url, index) => (
                      <div
                        key={index}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('text/plain', index.toString());
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                          if (fromIndex !== index) {
                            const newUrls = [...imageUrls];
                            const [moved] = newUrls.splice(fromIndex, 1);
                            newUrls.splice(index, 0, moved);
                            setImageUrls(newUrls);
                          }
                        }}
                        className="relative aspect-square group cursor-grab active:cursor-grabbing"
                      >
                        <Image
                          src={url}
                          alt={`Product image ${index + 1}`}
                          fill
                          className="object-cover rounded-lg pointer-events-none"
                          draggable={false}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                            {locale === 'el' ? 'Κύρια' : 'Main'}
                          </span>
                        )}
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-bold">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Link href="/admin/products" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                {locale === 'el' ? 'Ακύρωση' : 'Cancel'}
              </Button>
            </Link>
            <Button type="submit" className="flex-1" disabled={isLoading || !hasChanges}>
              {isLoading ? (locale === 'el' ? 'Ενημέρωση...' : 'Updating...') : (locale === 'el' ? 'Ενημέρωση Προϊόντος' : 'Update Product')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

