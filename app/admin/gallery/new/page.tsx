"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function NewGalleryItemPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    category: 'baptism' as 'baptism' | 'decoration',
    title_el: '',
    title_en: '',
    description_el: '',
    description_en: '',
    display_order: '0',
    is_active: true,
  });

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
          .from('gallery')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
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

      const { error } = await supabase.from('gallery_items').insert({
        category: formData.category,
        title_el: formData.title_el,
        title_en: formData.title_en,
        description_el: formData.description_el || null,
        description_en: formData.description_en || null,
        display_order: parseInt(formData.display_order),
        is_active: formData.is_active,
        images: imageUrls,
      });

      if (error) throw error;

      toast.success('Gallery item created successfully!');
      router.push('/admin/gallery');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create gallery item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/gallery">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add Gallery Item</h1>
          <p className="text-muted-foreground">Create a new gallery item</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'baptism' | 'decoration' })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="baptism">Baptism</option>
                  <option value="decoration">Decoration</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Display Order</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower numbers appear first
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Greek (Ελληνικά)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={formData.title_el}
                  onChange={(e) => setFormData({ ...formData, title_el: e.target.value })}
                  required
                  placeholder="Τίτλος"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  value={formData.description_el}
                  onChange={(e) => setFormData({ ...formData, description_el: e.target.value })}
                  placeholder="Περιγραφή"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>English</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  required
                  placeholder="Title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="Description"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gallery Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">
                      {uploadingImages ? 'Uploading...' : 'Click to upload images'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP up to 5MB each
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
                <div className="grid grid-cols-3 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative aspect-video group">
                      <Image
                        src={url}
                        alt={`Gallery image ${index + 1}`}
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
                          Main
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
                <span className="text-sm font-medium">Item is active</span>
              </label>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Link href="/admin/gallery" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Item'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

