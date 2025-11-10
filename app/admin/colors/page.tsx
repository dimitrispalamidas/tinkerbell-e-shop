"use client"

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Eye, EyeOff, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Color } from '@/lib/types/database';
import { translateText } from '@/lib/utils/translate';

type ColorFormData = {
  name_el: string;
  name_en: string;
  hex_value: string;
  is_active: boolean;
};

export default function AdminColorsPage() {
  const locale = useLocale();
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [formData, setFormData] = useState<ColorFormData>({
    name_el: '',
    name_en: '',
    hex_value: '#000000',
    is_active: true,
  });

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('colors')
        .select('*')
        .order('name_el');

      if (error) throw error;
      setColors(data || []);
    } catch (error) {
      console.error('Error fetching colors:', error);
      toast.error(locale === 'el' ? 'Αποτυχία φόρτωσης χρωμάτων' : 'Failed to fetch colors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (color?: Color) => {
    if (color) {
      setEditingColor(color);
      setFormData({
        name_el: color.name_el,
        name_en: color.name_en,
        hex_value: color.hex_value,
        is_active: color.is_active,
      });
    } else {
      setEditingColor(null);
      setFormData({
        name_el: '',
        name_en: '',
        hex_value: '#000000',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingColor(null);
    setIsTranslating(false);
    setFormData({
      name_el: '',
      name_en: '',
      hex_value: '#000000',
      is_active: true,
    });
  };

  const handleTranslate = async () => {
    if (!formData.name_el) {
      toast.error(locale === 'el' ? 'Παρακαλώ συμπληρώστε πρώτα το ελληνικό όνομα' : 'Please fill in the Greek name first');
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await translateText(formData.name_el, 'el', 'en');
      setFormData({ ...formData, name_en: translated });
      toast.success(locale === 'el' ? 'Μεταφράστηκε επιτυχώς!' : 'Translated successfully!');
    } catch (error) {
      toast.error(locale === 'el' ? 'Αποτυχία μετάφρασης' : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name_el.trim() || !formData.name_en.trim() || !formData.hex_value.trim()) {
      toast.error(locale === 'el' ? 'Παρακαλώ συμπληρώστε όλα τα πεδία' : 'Please fill all fields');
      return;
    }

    try {
      const supabase = createClient();

      if (editingColor) {
        // Update existing color
        const { error } = await supabase
          .from('colors')
          .update({
            name_el: formData.name_el.trim(),
            name_en: formData.name_en.trim(),
            hex_value: formData.hex_value.trim().toUpperCase(),
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingColor.id);

        if (error) throw error;
        toast.success(locale === 'el' ? 'Το χρώμα ενημερώθηκε' : 'Color updated');
      } else {
        // Create new color
        const { error } = await supabase
          .from('colors')
          .insert({
            name_el: formData.name_el.trim(),
            name_en: formData.name_en.trim(),
            hex_value: formData.hex_value.trim().toUpperCase(),
            is_active: formData.is_active,
          });

        if (error) throw error;
        toast.success(locale === 'el' ? 'Το χρώμα δημιουργήθηκε' : 'Color created');
      }

      fetchColors();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving color:', error);
      if (error.code === '23505') {
        toast.error(locale === 'el' ? 'Το χρώμα υπάρχει ήδη' : 'Color already exists');
      } else {
        toast.error(locale === 'el' ? 'Αποτυχία αποθήκευσης' : 'Failed to save');
      }
    }
  };

  const handleDelete = async (colorId: string, colorName: string) => {
    if (!confirm(locale === 'el' ? `Είστε σίγουροι ότι θέλετε να διαγράψετε το χρώμα "${colorName}";` : `Are you sure you want to delete color "${colorName}"?`)) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('colors')
        .delete()
        .eq('id', colorId);

      if (error) throw error;
      toast.success(locale === 'el' ? 'Το χρώμα διαγράφηκε' : 'Color deleted');
      fetchColors();
    } catch (error) {
      console.error('Error deleting color:', error);
      toast.error(locale === 'el' ? 'Αποτυχία διαγραφής' : 'Failed to delete');
    }
  };

  const handleToggleActive = async (color: Color) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('colors')
        .update({ 
          is_active: !color.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', color.id);

      if (error) throw error;
      toast.success(locale === 'el' ? 'Η κατάσταση ενημερώθηκε' : 'Status updated');
      fetchColors();
    } catch (error) {
      console.error('Error toggling color:', error);
      toast.error(locale === 'el' ? 'Αποτυχία ενημέρωσης' : 'Failed to update');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {locale === 'el' ? 'Φόρτωση...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {locale === 'el' ? 'Χρώματα' : 'Colors'}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {locale === 'el' ? 'Διαχείριση χρωμάτων προϊόντων' : 'Manage product colors'}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {locale === 'el' ? 'Προσθήκη Χρώματος' : 'Add Color'}
        </Button>
      </div>

      {/* Colors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colors.map((color) => (
          <Card key={color.id} className={!color.is_active ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Color Swatch */}
                <div 
                  className="w-16 h-16 rounded-lg border-2 border-gray-200 shadow-sm flex-shrink-0"
                  style={{ backgroundColor: color.hex_value }}
                  title={color.hex_value}
                />
                
                {/* Color Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-lg truncate">
                      {locale === 'el' ? color.name_el : color.name_en}
                    </h3>
                    {!color.is_active && (
                      <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                        {locale === 'el' ? 'Ανενεργό' : 'Inactive'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'el' ? color.name_en : color.name_el}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    {color.hex_value}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(color)}
                    title={color.is_active ? (locale === 'el' ? 'Απενεργοποίηση' : 'Deactivate') : (locale === 'el' ? 'Ενεργοποίηση' : 'Activate')}
                  >
                    {color.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(color)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(color.id, locale === 'el' ? color.name_el : color.name_en)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {colors.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {locale === 'el' ? 'Δεν υπάρχουν χρώματα. Προσθέστε το πρώτο χρώμα!' : 'No colors yet. Add your first color!'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingColor 
                ? (locale === 'el' ? 'Επεξεργασία Χρώματος' : 'Edit Color')
                : (locale === 'el' ? 'Νέο Χρώμα' : 'New Color')
              }
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name_el">
                {locale === 'el' ? 'Όνομα (Ελληνικά)' : 'Name (Greek)'}
              </Label>
              <Input
                id="name_el"
                value={formData.name_el}
                onChange={(e) => setFormData({ ...formData, name_el: e.target.value })}
                placeholder={locale === 'el' ? 'π.χ. Μπλε' : 'e.g. Μπλε'}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="name_en">
                  {locale === 'el' ? 'Όνομα (Αγγλικά)' : 'Name (English)'}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleTranslate}
                  disabled={isTranslating || !formData.name_el}
                  className="h-8 text-xs"
                >
                  <Languages className="h-4 w-4 mr-1" />
                  {isTranslating 
                    ? (locale === 'el' ? 'Μετάφραση...' : 'Translating...') 
                    : (locale === 'el' ? 'Μετάφραση' : 'Translate')
                  }
                </Button>
              </div>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                placeholder={locale === 'el' ? 'π.χ. Blue' : 'e.g. Blue'}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hex_value">
                {locale === 'el' ? 'Κωδικός Χρώματος (Hex)' : 'Color Code (Hex)'}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="hex_value"
                  type="text"
                  value={formData.hex_value}
                  onChange={(e) => setFormData({ ...formData, hex_value: e.target.value })}
                  placeholder="#000000"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  required
                  className="flex-1"
                />
                <input
                  type="color"
                  value={formData.hex_value}
                  onChange={(e) => setFormData({ ...formData, hex_value: e.target.value })}
                  className="w-16 h-10 rounded border border-input cursor-pointer"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {locale === 'el' ? 'Χρησιμοποιήστε το πεδίο ή τον επιλογέα χρώματος' : 'Use the field or color picker'}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                {locale === 'el' ? 'Ενεργό' : 'Active'}
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                {locale === 'el' ? 'Ακύρωση' : 'Cancel'}
              </Button>
              <Button type="submit">
                {editingColor 
                  ? (locale === 'el' ? 'Ενημέρωση' : 'Update')
                  : (locale === 'el' ? 'Δημιουργία' : 'Create')
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

