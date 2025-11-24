"use client"

import { useState } from 'react';
import { useLocale } from 'next-intl';
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
  const locale = useLocale();

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    category: (categoryParam || 'baptism') as 'baptism' | 'decoration',
    position: 'beginning' as 'beginning' | 'end',
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
          toast.info(locale === 'el' ? 'Η φωτογραφία είναι έτοιμη για ανέβασμα' : 'Photo ready for upload');
        } else {
          toast.info(locale === 'el' ? `${uploadedUrls.length} φωτογραφίες είναι έτοιμες για ανέβασμα` : `${uploadedUrls.length} photos ready for upload`);
        }
      }
    } catch (error: any) {
      toast.error(error.message || (locale === 'el' ? 'Αποτυχία ανεβάσματος' : 'Upload failed'));
    } finally {
      setUploadingImages(false);
      setUploadProgress({ current: 0, total: 0 });
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
          .from('gallery')
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
    
    if (imageUrls.length === 0) {
      toast.error(locale === 'el' ? 'Απαιτείται εικόνα' : 'Image is required');
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
        toast.success(locale === 'el' ? 'Η φωτογραφία ανέβηκε επιτυχώς' : 'Photo uploaded successfully');
      } else {
        toast.success(locale === 'el' ? `${imageUrls.length} φωτογραφίες ανέβηκαν επιτυχώς` : `${imageUrls.length} photos uploaded successfully`);
      }
      
      router.push(`/admin/gallery${formData.category ? `?tab=${formData.category}` : ''}`);
    } catch (error: any) {
      console.error('Failed to create gallery items:', error);
      toast.error(error.message || (locale === 'el' ? 'Αποτυχία δημιουργίας gallery' : 'Failed to create gallery'));
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
          <h1 className="text-3xl font-bold">{locale === 'el' ? 'Προσθήκη Φωτογραφίας' : 'Add Photo'}</h1>
          <p className="text-muted-foreground">{locale === 'el' ? 'Ανεβάστε πολλές φωτογραφίες μαζί στη γκαλερί' : 'Upload multiple photos to the gallery at once'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'el' ? 'Βασικές Πληροφορίες' : 'Basic Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{locale === 'el' ? 'Κατηγορία *' : 'Category *'}</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'baptism' | 'decoration' })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="baptism">{locale === 'el' ? 'Βαπτιστικά' : 'Baptism'}</option>
                  <option value="decoration">{locale === 'el' ? 'Στολισμός' : 'Decoration'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{locale === 'el' ? 'Θέση' : 'Position'}</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value as 'beginning' | 'end' })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="end">{locale === 'el' ? 'Προσθήκη στο τέλος' : 'Add to end'}</option>
                  <option value="beginning">{locale === 'el' ? 'Προσθήκη στην αρχή' : 'Add to beginning'}</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {locale === 'el' ? 'Όλες οι φωτογραφίες θα προστεθούν στην επιλεγμένη θέση' : 'All photos will be added at the selected position'}
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
                  {locale === 'el' ? 'Ενεργό (ορατό στην ιστοσελίδα)' : 'Active (visible on website)'}
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{locale === 'el' ? 'Φωτογραφίες Γκαλερί *' : 'Gallery Images *'}</CardTitle>
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
                        {locale === 'el' ? `Ανέβασμα ${uploadProgress.current} από ${uploadProgress.total} φωτογραφίες...` : `Uploading ${uploadProgress.current} of ${uploadProgress.total} photos...`}
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
                        {locale === 'el' ? 'Κάντε κλικ για ανέβασμα ή βγάλτε φωτογραφίες' : 'Click to upload or take photos'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {locale === 'el' ? 'Επιλέξτε πολλές φωτογραφίες μαζί (Ctrl/Cmd + κλικ)' : 'Select multiple images at once (Ctrl/Cmd + click)'}
                      </p>
                    </>
                  )}
                </label>
              </div>

              {imageUrls.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">
                    {locale === 'el' ? 'Επιλεγμένες φωτογραφίες' : 'Selected images'}: {imageUrls.length}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square">
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          unoptimized
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
                {locale === 'el' ? 'Ακύρωση' : 'Cancel'}
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading || imageUrls.length === 0} className="flex-1">
              {isLoading ? (locale === 'el' ? 'Δημιουργία...' : 'Creating...') : (locale === 'el' ? `Ανέβασμα ${imageUrls.length} φωτογραφιών` : `Upload ${imageUrls.length} images`)}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
