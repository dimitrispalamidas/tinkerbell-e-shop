#!/usr/bin/env tsx
/**
 * Συγχρονισμός εικόνων από Storage στη βάση
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // Πάρε όλες τις εικόνες από το Storage
  const { data: files, error: storageError } = await supabase.storage
    .from('products')
    .list();

  if (storageError) {
    console.error('❌ Storage error:', storageError);
    return;
  }

  // Ομαδοποίηση εικόνων ανά SKU
  const imagesBySKU: Record<string, string[]> = {};

  files.forEach(file => {
    // Το όνομα είναι: sku_1_timestamp.jpg, sku_2_timestamp.jpg, κλπ
    const sku = file.name.split('_')[0].toUpperCase();
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/products/${file.name}`;
    
    if (!imagesBySKU[sku]) {
      imagesBySKU[sku] = [];
    }
    imagesBySKU[sku].push(publicUrl);
  });

  // Ενημέρωση κάθε προϊόντος
  for (const [sku, urls] of Object.entries(imagesBySKU)) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ images: urls })
        .eq('sku', sku);

      if (error) throw error;
    } catch (error: any) {
      console.error(`❌ ${sku}: ${error.message}`);
    }
  }
}

main().catch(console.error);

