"use client"

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

export type Variant = {
  size: string;
  color: string;
  stock: number;
};

type VariantManagerProps = {
  sizes: string[];
  colors: string[];
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
};

export function VariantManager({ sizes, colors, variants, onChange }: VariantManagerProps) {
  const locale = useLocale();
  
  const [localVariants, setLocalVariants] = useState<Variant[]>(variants);

  useEffect(() => {
    setLocalVariants(variants);
  }, [variants]);

  const addVariant = () => {
    const newVariant: Variant = {
      size: sizes[0] || '',
      color: colors[0] || '',
      stock: 0,
    };
    const updated = [...localVariants, newVariant];
    setLocalVariants(updated);
    onChange(updated);
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const updated = [...localVariants];
    updated[index] = { ...updated[index], [field]: value };
    
    // Check for duplicates
    const hasDuplicate = updated.some((v, i) => 
      i !== index && v.size === updated[index].size && v.color === updated[index].color
    );
    
    if (hasDuplicate) {
      // Remove the duplicate (keep the one being edited)
      const filtered = updated.filter((v, i) => 
        i === index || !(v.size === updated[index].size && v.color === updated[index].color)
      );
      setLocalVariants(filtered);
      onChange(filtered);
    } else {
      setLocalVariants(updated);
      onChange(updated);
    }
  };

  const removeVariant = (index: number) => {
    const updated = localVariants.filter((_, i) => i !== index);
    setLocalVariants(updated);
    onChange(updated);
  };

  const generateAllCombinations = () => {
    if (sizes.length === 0 || colors.length === 0) {
      return;
    }

    const combinations: Variant[] = [];
    sizes.forEach(size => {
      colors.forEach(color => {
        // Check if combination already exists
        const exists = localVariants.some(v => v.size === size && v.color === color);
        if (!exists) {
          combinations.push({ size, color, stock: 0 });
        }
      });
    });

    if (combinations.length > 0) {
      const updated = [...localVariants, ...combinations];
      setLocalVariants(updated);
      onChange(updated);
    }
  };

  if (sizes.length === 0 || colors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {locale === 'el' ? 'Διαχείριση Αποθέματος' : 'Stock Management'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {locale === 'el' ? 'Προσθέστε πρώτα μεγέθη και χρώματα για να διαχειριστείτε το απόθεμα.' : 'Add sizes and colors first to manage stock.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="mb-4">
          {locale === 'el' ? 'Διαχείριση Αποθέματος' : 'Stock Management'}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateAllCombinations}
          >
            <Plus className="h-4 w-4 mr-1" />
            {locale === 'el' ? 'Δημιουργία Όλων' : 'Generate All'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariant}
          >
            <Plus className="h-4 w-4 mr-1" />
            {locale === 'el' ? 'Προσθήκη' : 'Add'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {localVariants.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {locale === 'el' ? 'Δεν υπάρχουν παραλλαγές. Κλικ "Δημιουργία Όλων" για αυτόματη δημιουργία όλων των συνδυασμών.' : 'No variants. Click "Generate All" to automatically create all combinations.'}
          </p>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <div className="space-y-3 min-w-[400px]">
              <div className="grid grid-cols-[100px_120px_100px_40px] gap-3 text-sm font-medium text-muted-foreground pb-2 border-b">
                <div>{locale === 'el' ? 'Μέγεθος' : 'Size'}</div>
                <div>{locale === 'el' ? 'Χρώμα' : 'Color'}</div>
                <div>{locale === 'el' ? 'Απόθεμα' : 'Stock'}</div>
                <div></div>
              </div>
              {localVariants.map((variant, index) => (
                <div key={index} className="grid grid-cols-[100px_120px_100px_40px] gap-3 items-center">
                  <select
                    value={variant.size}
                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    {sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>

                  <select
                    value={variant.color}
                    onChange={(e) => updateVariant(index, 'color', e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    {colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>

                  <Input
                    type="number"
                    min="0"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariant(index)}
                    className="text-destructive hover:text-destructive"
                    title={locale === 'el' ? 'Διαγραφή' : 'Delete'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          {locale === 'el' ? 'Συνολικό απόθεμα' : 'Total stock'}: {localVariants.reduce((sum, v) => sum + v.stock, 0)} {locale === 'el' ? 'τεμάχια' : 'pieces'}
        </p>
      </CardContent>
    </Card>
  );
}
