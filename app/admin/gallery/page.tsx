"use client"

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { GalleryItem } from '@/lib/types/database';

type TabType = 'baptism' | 'decoration';

export default function AdminGalleryPage() {
  const locale = useLocale();
  
  const [activeTab, setActiveTab] = useState<TabType>('baptism');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [baptismCount, setBaptismCount] = useState(0);
  const [decorationCount, setDecorationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [statusChanges, setStatusChanges] = useState<Map<string, boolean>>(new Map());

  // Check URL for tab parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as TabType | null;
      if (tabParam && (tabParam === 'baptism' || tabParam === 'decoration')) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  useEffect(() => {
    // Clear any unsaved changes when switching tabs
    setHasUnsavedOrder(false);
    setStatusChanges(new Map());
    fetchGalleryItems();
    fetchCounts();
  }, [activeTab]);

  const fetchGalleryItems = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('category', activeTab)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Failed to fetch gallery items:', error);
      toast.error(locale === 'el' ? 'Αποτυχία φόρτωσης gallery' : 'Failed to fetch gallery');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const supabase = createClient();
      const [baptismResult, decorationResult] = await Promise.all([
        supabase.from('gallery_items').select('id', { count: 'exact', head: true }).eq('category', 'baptism'),
        supabase.from('gallery_items').select('id', { count: 'exact', head: true }).eq('category', 'decoration'),
      ]);
      
      setBaptismCount(baptismResult.count || 0);
      setDecorationCount(decorationResult.count || 0);
    } catch (error) {
      console.error('Failed to fetch counts:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    
    if (!draggedItemId || draggedItemId === targetItemId) {
      setDraggedItemId(null);
      return;
    }

    const draggedIndex = items.findIndex(item => item.id === draggedItemId);
    const targetIndex = items.findIndex(item => item.id === targetItemId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder locally
    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);

    // Update display_order for all affected items
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      display_order: index,
    }));

    setItems(updatedItems);
    setDraggedItemId(null);
    setHasUnsavedOrder(true); // Mark as having unsaved changes
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    try {
      const supabase = createClient();
      
      // Prepare all updates (both order and status changes)
      const updates = items.map(item => {
        const updateData: any = { display_order: item.display_order };
        
        // If this item has a status change, include it
        if (statusChanges.has(item.id)) {
          updateData.is_active = statusChanges.get(item.id);
        }
        
        return supabase
          .from('gallery_items')
          .update(updateData)
          .eq('id', item.id)
          .then();
      });

      await Promise.all(updates);
      setHasUnsavedOrder(false);
      setStatusChanges(new Map()); // Clear status changes
      toast.success(locale === 'el' ? 'Οι αλλαγές αποθηκεύτηκαν' : 'Changes saved');
      await fetchGalleryItems();
    } catch (error) {
      console.error('Failed to save changes:', error);
      toast.error(locale === 'el' ? 'Αποτυχία αποθήκευσης' : 'Failed to save changes');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleCancelOrder = () => {
    setHasUnsavedOrder(false);
    setStatusChanges(new Map()); // Clear status changes
    fetchGalleryItems(); // Reload original data
  };

  const renumberDisplayOrder = async (category: TabType) => {
    try {
      const supabase = createClient();
      
      // Get all items in order
      const { data: items } = await supabase
        .from('gallery_items')
        .select('id, display_order')
        .eq('category', category)
        .order('display_order', { ascending: true });

      if (!items || items.length === 0) return;

      // Update each item with sequential order
      const updates = items.map((item, index) => 
        supabase
          .from('gallery_items')
          .update({ display_order: index })
          .eq('id', item.id)
          .then()
      );

      await Promise.all(updates);
    } catch (error) {
      console.error('Failed to renumber display order:', error);
    }
  };

  const extractFileNameFromUrl = (url: string): string | null => {
    try {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    } catch {
      return null;
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm(locale === 'el' ? 'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη φωτογραφία;' : 'Are you sure you want to delete this photo?')) return;

    try {
      const supabase = createClient();
      
      // Get the item to extract image URL
      const itemToDelete = items.find(item => item.id === itemId);
      
      if (itemToDelete?.image) {
        const fileName = extractFileNameFromUrl(itemToDelete.image);
        if (fileName) {
          // Delete from storage bucket
          const { error: storageError } = await supabase.storage
            .from('gallery')
            .remove([fileName]);
          
          if (storageError) {
            console.error('Failed to delete from storage:', storageError);
          }
        }
      }
      
      // Delete from database
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      // Renumber remaining items
      await renumberDisplayOrder(activeTab);
      
      // Wait a bit for DB to update, then fetch
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast.success(locale === 'el' ? 'Η φωτογραφία διαγράφηκε' : 'Photo deleted');
      await fetchGalleryItems();
      await fetchCounts();
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error(locale === 'el' ? 'Αποτυχία διαγραφής' : 'Failed to delete');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    
    if (!confirm(locale === 'el' ? `Είστε σίγουροι ότι θέλετε να διαγράψετε ${selectedItems.size} φωτογραφίες;` : `Are you sure you want to delete ${selectedItems.size} photos?`)) return;

    setIsDeleting(true);
    try {
      const supabase = createClient();
      
      // Get items to delete for storage cleanup
      const itemsToDelete = items.filter(item => selectedItems.has(item.id));
      
      // Delete from storage bucket
      const fileNames = itemsToDelete
        .map(item => extractFileNameFromUrl(item.image))
        .filter(Boolean) as string[];
      
      if (fileNames.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('gallery')
          .remove(fileNames);
        
        if (storageError) {
          console.error('Failed to delete from storage:', storageError);
        }
      }
      
      // Delete from database
      const deletePromises = Array.from(selectedItems).map(itemId =>
        supabase.from('gallery_items').delete().eq('id', itemId).then()
      );
      
      await Promise.all(deletePromises);
      
      // Renumber remaining items
      await renumberDisplayOrder(activeTab);
      
      // Wait a bit for DB to update, then fetch
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast.success(locale === 'el' ? `${selectedItems.size} φωτογραφίες διαγράφηκαν` : `${selectedItems.size} photos deleted`);
      setSelectedItems(new Set());
      await fetchGalleryItems();
      await fetchCounts();
    } catch (error) {
      console.error('Failed to bulk delete:', error);
      toast.error(locale === 'el' ? 'Αποτυχία μαζικής διαγραφής' : 'Failed to bulk delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  const handleToggleActive = (itemId: string, currentStatus: boolean) => {
    // Update local state
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, is_active: !currentStatus } 
          : item
      )
    );
    
    // Track the change
    setStatusChanges(prev => {
      const newChanges = new Map(prev);
      newChanges.set(itemId, !currentStatus);
      return newChanges;
    });
    
    // Mark as having unsaved changes
    setHasUnsavedOrder(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{locale === 'el' ? 'Φόρτωση...' : 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{locale === 'el' ? 'Γκαλερί' : 'Gallery'}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{locale === 'el' ? 'Διαχείριση φωτογραφιών βαπτιστικών και στολισμών' : 'Manage baptism and decoration photos'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasUnsavedOrder && (
            <>
              <Button 
                variant="outline"
                onClick={handleCancelOrder}
                disabled={isSavingOrder}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                {locale === 'el' ? 'Ακύρωση' : 'Cancel'}
              </Button>
              <Button 
                onClick={handleSaveOrder}
                disabled={isSavingOrder}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                {isSavingOrder ? (locale === 'el' ? 'Αποθήκευση...' : 'Saving...') : (locale === 'el' ? 'Αποθήκευση Αλλαγών' : 'Save Changes')}
              </Button>
            </>
          )}
          {selectedItems.size > 0 && (
            <Button 
              variant="outline" 
              onClick={handleBulkDelete}
              disabled={isDeleting || hasUnsavedOrder}
              size="sm"
              className="border-red-600 text-red-600 hover:bg-red-50 flex-1 sm:flex-none"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">{locale === 'el' ? `Διαγραφή ${selectedItems.size} επιλεγμένων` : `Delete ${selectedItems.size} selected`}</span>
            </Button>
          )}
          <Link href={`/admin/gallery/new?category=${activeTab}`} className="flex-1 sm:flex-none">
            <Button disabled={hasUnsavedOrder} size="sm" className="w-full">
              <Plus className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">{locale === 'el' ? 'Προσθήκη Φωτογραφίας' : 'Add Photo'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b overflow-x-auto">
        <nav className="flex gap-2 md:gap-4 min-w-max">
          <button
            onClick={() => setActiveTab('baptism')}
            className={`px-3 md:px-4 py-2 md:py-3 border-b-2 font-medium transition-colors text-sm md:text-base whitespace-nowrap ${
              activeTab === 'baptism'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {locale === 'el' ? 'Βαπτιστικά' : 'Baptism'} ({baptismCount})
          </button>
          <button
            onClick={() => setActiveTab('decoration')}
            className={`px-3 md:px-4 py-2 md:py-3 border-b-2 font-medium transition-colors text-sm md:text-base whitespace-nowrap ${
              activeTab === 'decoration'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {locale === 'el' ? 'Στολισμός' : 'Decoration'} ({decorationCount})
          </button>
        </nav>
      </div>

      {/* Photos Grid */}
      {items && items.length > 0 ? (
        <>
          {/* Select All */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="select-all"
              checked={selectedItems.size === items.length && items.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor="select-all" className="text-xs md:text-sm font-medium cursor-pointer">
              {locale === 'el' ? 'Επιλογή όλων' : 'Select all'} ({items.length})
            </label>
          </div>

          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {items.map((item) => (
              <Card
                key={item.id}
                draggable={!selectedItems.has(item.id)}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item.id)}
                className={`${selectedItems.has(item.id) ? '' : 'cursor-grab active:cursor-grabbing'} ${draggedItemId === item.id ? 'opacity-50' : ''} ${selectedItems.has(item.id) ? 'ring-2 ring-primary' : ''}`}
              >
                <CardContent className="p-1 md:p-1.5">
                  <div className="aspect-square bg-muted rounded overflow-hidden mb-1 relative group">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={`Photo ${item.display_order + 1}`}
                      width={300}
                      height={300}
                      className="object-cover w-full h-full"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      {locale === 'el' ? 'Χωρίς εικόνα' : 'No image'}
                    </div>
                  )}
                  
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleSelectItem(item.id)}
                    className="absolute top-1 md:top-1.5 left-1 md:left-1.5 z-10 w-3.5 h-3.5 md:w-4 md:h-4 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />

                  {/* Order Badge */}
                  <div className="absolute top-1 md:top-1.5 right-1 md:right-1.5 bg-black/70 text-white text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded font-bold">
                    #{item.display_order + 1}
                  </div>

                  {/* Status Badge */}
                  <div className={`absolute bottom-1 md:bottom-1.5 left-1 md:left-1.5 text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded ${
                    item.is_active ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'
                  }`}>
                    {item.is_active ? (locale === 'el' ? 'Ενεργό' : 'Active') : (locale === 'el' ? 'Ανενεργό' : 'Inactive')}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-0.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-6 md:h-7 p-0 text-sm md:text-base"
                    onClick={() => handleToggleActive(item.id, item.is_active)}
                    title={item.is_active ? (locale === 'el' ? 'Απενεργοποίηση' : 'Deactivate') : (locale === 'el' ? 'Ενεργοποίηση' : 'Activate')}
                  >
                    {item.is_active ? '👁️' : '👁️‍🗨️'}
                  </Button>
                  <Link href={`/admin/gallery/${item.id}?category=${activeTab}`}>
                    <Button variant="outline" size="sm" title={locale === 'el' ? 'Επεξεργασία' : 'Edit'} className="h-6 md:h-7 w-6 md:w-7 p-0">
                      <Pencil className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    title={locale === 'el' ? 'Διαγραφή' : 'Delete'}
                    className="h-6 md:h-7 w-6 md:w-7 p-0"
                  >
                    <Trash2 className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 md:p-12 text-center">
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              {activeTab === 'baptism' ? (locale === 'el' ? 'Δεν υπάρχουν στοιχεία βάπτισης' : 'No baptism items') : (locale === 'el' ? 'Δεν υπάρχουν στοιχεία διακόσμησης' : 'No decoration items')}
            </p>
            <Link href="/admin/gallery/new" className="inline-block w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                {locale === 'el' ? 'Προσθήκη Φωτογραφίας' : 'Add Photo'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
