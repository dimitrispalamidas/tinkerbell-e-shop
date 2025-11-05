"use client"

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Image from 'next/image';

export default function NewGalleryItemPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') as 'baptism' | 'decoration' | null;
  
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    category: (categoryParam || 'baptism') as 'baptism' | 'decoration',
    position: 'end' as 'beginning' | 'end',
    is_active: true,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setUploadProgress({ current: 0, total: files.length });
    
    try {
      const supabase = createClient();
      const BATCH_SIZE = 5; // Upload 5 files in parallel
      const filesArray = Array.from(files);
      const uploadedUrls: string[] = [];
      let completed = 0;

      // Process files in batches
      for (let i = 0; i < filesArray.length; i += BATCH_SIZE) {
        const batch = filesArray.slice(i, i + BATCH_SIZE);
        
        const batchPromises = batch.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

          try {
            const { error: uploadError } = await supabase.storage
              .from('gallery')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
              });

            if (uploadError) {
              console.error(`Failed to upload ${file.name}:`, uploadError);
              return null;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('gallery')
              .getPublicUrl(fileName);

            return publicUrl;
          } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
            return null;
          }
        });

        // Wait for batch to complete
        const batchResults = await Promise.all(batchPromises);
        
        // Filter out failed uploads and add successful ones
        const successfulUploads = batchResults.filter(url => url !== null) as string[];
        uploadedUrls.push(...successfulUploads);
        
        // Update progress
        completed += batch.length;
        setUploadProgress({ current: completed, total: filesArray.length });
      }

      setImageUrls(prev => [...prev, ...uploadedUrls]);
      
      if (uploadedUrls.length < files.length) {
        const failed = files.length - uploadedUrls.length;
        toast.warning(`${uploadedUrls.length} από ${files.length} φωτογραφίες επιλέχθηκαν. ${failed} απέτυχαν.`);
      } else {
        // Show "ready for upload" message instead of "uploaded"
        if (uploadedUrls.length === 1) {
          toast.info(t('photo_ready_for_upload'));
        } else {
          toast.info(t('photos_ready_for_upload', { count: uploadedUrls.length }));
        }
      }
    } catch (error: any) {
      toast.error(error.message || t('failed_upload'));
    } finally {
      setUploadingImages(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (imageUrls.length === 0) {
      toast.error(t('image_required'));
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Get current max display_order for the category
      const { data: existingItems, error: fetchError } = await supabase
        .from('gallery_items')
        .select('display_order')
        .eq('category', formData.category)
        .order('display_order', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      let startOrder = 0;
      
      if (formData.position === 'beginning') {
        // If adding to beginning, start from 0 and shift all existing
        startOrder = 0;
        
        // Shift all existing items by the number of new images
        const { data: allItems } = await supabase
          .from('gallery_items')
          .select('id, display_order')
          .eq('category', formData.category)
          .order('display_order', { ascending: false });

        if (allItems && allItems.length > 0) {
          const updates = allItems.map(item => 
            supabase
              .from('gallery_items')
              .update({ display_order: item.display_order + imageUrls.length })
              .eq('id', item.id)
          );
          await Promise.all(updates);
        }
      } else {
        // Add to end
        startOrder = existingItems && existingItems.length > 0 
          ? existingItems[0].display_order + 1 
          : 0;
      }

      // Insert all images
      const itemsToInsert = imageUrls.map((imageUrl, index) => ({
        category: formData.category,
        image: imageUrl,
        display_order: startOrder + index,
        is_active: formData.is_active,
      }));

      const { error: insertError } = await supabase
        .from('gallery_items')
        .insert(itemsToInsert);

      if (insertError) throw insertError;

      // Success message after actual upload to database
      if (imageUrls.length === 1) {
        toast.success(t('photo_uploaded_success'));
      } else {
        toast.success(t('photos_uploaded_success', { count: imageUrls.length }));
      }
      
      router.push(`/admin/gallery${formData.category ? `?tab=${formData.category}` : ''}`);
    } catch (error: any) {
      console.error('Failed to create gallery items:', error);
      toast.error(error.message || t('failed_create_gallery'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/gallery${categoryParam ? `?tab=${categoryParam}` : ''}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{t('add_gallery_item')}</h1>
          <p className="text-muted-foreground">{t('add_gallery_subtitle_bulk')}</p>
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
                <label className="block text-sm font-medium mb-2">{t('position')}</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value as 'beginning' | 'end' })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="end">{t('add_to_end')}</option>
                  <option value="beginning">{t('add_to_beginning')}</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('position_hint_bulk')}
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
              <CardTitle>{t('gallery_images_required')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="images-upload"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImages}
                />
                <label htmlFor="images-upload" className={uploadingImages ? 'pointer-events-none' : 'cursor-pointer'}>
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  {uploadingImages ? (
                    <>
                      <p className="text-sm font-medium mb-2">
                        {t('uploading_progress', { current: uploadProgress.current, total: uploadProgress.total })}
                      </p>
                      <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2.5 mb-2">
                        <div 
                          className="bg-primary h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mb-2">
                        {t('click_to_upload_multiple')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('select_multiple_hint')}
                      </p>
                    </>
                  )}
                </label>
              </div>

              {imageUrls.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">
                    {t('selected_images')}: {imageUrls.length}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square">
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
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
            <Button type="submit" disabled={isLoading || imageUrls.length === 0} className="flex-1">
              {isLoading ? t('creating') : t('create_items', { count: imageUrls.length })}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
