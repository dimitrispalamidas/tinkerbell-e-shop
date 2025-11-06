"use client"

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Image from 'next/image';

export default function EditGalleryItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') as 'baptism' | 'decoration' | null;
  
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const [isFetching, setIsFetching] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [originalOrder, setOriginalOrder] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [formData, setFormData] = useState({
    category: 'baptism' as 'baptism' | 'decoration',
    display_order: '0',
    is_active: true,
  });

  useEffect(() => {
    fetchGalleryItem();
  }, [itemId]);

  const renumberDisplayOrder = async (category: 'baptism' | 'decoration') => {
    try {
      const supabase = createClient();
      
      // Get all items in order
      const { data: items } = await supabase
        .from('gallery_items')
        .select('id, display_order')
        .eq('category', category)
        .order('display_order', { ascending: true });

      if (!items || items.length === 0) return;

      // Update each item with sequential order (only if changed)
      const updates = items
        .map((item, index) => {
          if (item.display_order !== index) {
            return supabase
              .from('gallery_items')
              .update({ display_order: index })
              .eq('id', item.id)
              .then();
          }
          return null;
        })
        .filter(Boolean);

      if (updates.length > 0) {
        await Promise.all(updates);
        console.log(`✅ Renumbered ${updates.length} items in ${category}`);
      }
    } catch (error) {
      console.error('Failed to renumber display order:', error);
    }
  };

  const fetchGalleryItem = async () => {
    try {
      const supabase = createClient();
      
      // Get the item
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;

      if (data) {
        // First, fix any ordering inconsistencies
        await renumberDisplayOrder(data.category);
        
        // Re-fetch to get corrected order
        const { data: refreshedData } = await supabase
          .from('gallery_items')
          .select('*')
          .eq('id', itemId)
          .single();
        
        const finalData = refreshedData || data;
        
        setFormData({
          category: finalData.category,
          display_order: (finalData.display_order + 1).toString(), // Show 1-based to user
          is_active: finalData.is_active,
        });
        setOriginalOrder(finalData.display_order); // Store 0-based internally
        setImageUrl(finalData.image || '');
        
        // Get total count for the category
        const { count } = await supabase
          .from('gallery_items')
          .select('id', { count: 'exact', head: true })
          .eq('category', finalData.category);
        
        setTotalItems(count || 0);
      }
    } catch (error: any) {
      console.error('Failed to fetch gallery item:', error);
      toast.error(t('failed_fetch_gallery'));
    } finally {
      setIsFetching(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
      toast.success(t('image_uploaded'));
    } catch (error: any) {
      toast.error(error.message || t('failed_upload'));
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImageUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl) {
      toast.error(t('image_required'));
      return;
    }

    const userOrder = parseInt(formData.display_order); // 1-based from user
    
    if (isNaN(userOrder) || userOrder < 1) {
      toast.error(t('invalid_order'));
      return;
    }

    const newOrder = userOrder - 1; // Convert to 0-based for database

    setIsLoading(true);

    try {
      const supabase = createClient();

      // If order changed, we need to reorder items
      if (newOrder !== originalOrder) {
        // Get all items in the category except current one
        const { data: allItems } = await supabase
          .from('gallery_items')
          .select('id, display_order')
          .eq('category', formData.category)
          .neq('id', itemId)
          .order('display_order', { ascending: true });

        if (allItems) {
          // Insert the current item at the new position
          const updates: PromiseLike<any>[] = [];
          
          if (newOrder < originalOrder) {
            // Moving up: shift items down from newOrder to originalOrder-1
            allItems.forEach(item => {
              if (item.display_order >= newOrder && item.display_order < originalOrder) {
                updates.push(
                  supabase
                    .from('gallery_items')
                    .update({ display_order: item.display_order + 1 })
                    .eq('id', item.id)
                    .then()
                );
              }
            });
          } else if (newOrder > originalOrder) {
            // Moving down: shift items up from originalOrder+1 to newOrder
            allItems.forEach(item => {
              if (item.display_order > originalOrder && item.display_order <= newOrder) {
                updates.push(
                  supabase
                    .from('gallery_items')
                    .update({ display_order: item.display_order - 1 })
                    .eq('id', item.id)
                    .then()
                );
              }
            });
          }
          
          // Apply all updates
          if (updates.length > 0) {
            await Promise.all(updates);
          }
        }
      }

      // Update the current item
      const { error } = await supabase
        .from('gallery_items')
        .update({
          category: formData.category,
          image: imageUrl,
          display_order: newOrder,
          is_active: formData.is_active,
        })
        .eq('id', itemId);

      if (error) throw error;

      // Renumber all items in the category to fix any gaps
      await renumberDisplayOrder(formData.category);

      toast.success(t('gallery_item_updated'));
      router.push(`/admin/gallery${formData.category ? `?tab=${formData.category}` : ''}`);
    } catch (error: any) {
      console.error('Failed to update gallery item:', error);
      toast.error(error.message || t('failed_update_gallery'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{tCommon('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/gallery${categoryParam ? `?tab=${categoryParam}` : ''}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{t('edit_gallery_item')}</h1>
          <p className="text-muted-foreground">{t('edit_gallery_subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('basic_info')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('category_required')}</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'baptism' | 'decoration' })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="baptism">{t('baptism')}</option>
                  <option value="decoration">{t('decoration')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('display_order')}</label>
                <Input
                  type="number"
                  min="1"
                  max={totalItems}
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                  placeholder="1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('display_order_edit_hint', { total: totalItems, current: originalOrder + 1 })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm">
                  {t('is_active_label')}
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('gallery_image_required')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!imageUrl ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {uploadingImage ? t('uploading') : t('click_to_upload')}
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative aspect-square w-full max-w-md mx-auto">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Link href={`/admin/gallery${categoryParam ? `?tab=${categoryParam}` : ''}`} className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                {tCommon('cancel')}
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading || !imageUrl} className="flex-1">
              {isLoading ? t('saving') : tCommon('save')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
