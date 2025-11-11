#!/usr/bin/env tsx
/**
 * Αυτόματο γέμισμα εικόνων προϊόντων από Unsplash API
 * 
 * Usage:
 *   pnpm tsx scripts/populate-product-images.ts
 * 
 * Κατεβάζει εικόνες από Unsplash, τις ανεβάζει στο Supabase Storage
 * και ενημερώνει αυτόματα τα προϊόντα στη βάση
 */

import { createClient } from '@supabase/supabase-js';
import https from 'https';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Unsplash Access Key (δωρεάν, δημιουργείς account στο unsplash.com/developers)
// Αν δεν έχεις, άφησε το κενό και θα χρησιμοποιήσει το Lorem Picsum
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapping από κατηγορία σε search terms για εικόνες
const SEARCH_TERMS: Record<string, string[]> = {
  'boys-clothing': ['kids boys clothing', 'boys shirt', 'kids boys fashion'],
  'girls-clothing': ['kids girls dress', 'girls clothing', 'kids girls fashion'],
  'boys-shoes': ['kids boys sneakers', 'boys shoes', 'kids boys footwear'],
  'girls-shoes': ['girls sandals', 'kids girls shoes', 'girls footwear'],
  'default': ['kids clothing', 'children fashion']
};

// Mapping από SKU prefix σε search term
const SKU_SEARCH_TERMS: Record<string, string> = {
  'TSH': 'kids t-shirt',
  'DRS': 'kids dress',
  'SNK': 'kids sneakers',
  'SND': 'kids sandals',
  'JNS': 'kids jeans',
};

/**
 * Κατεβάζει εικόνα από URL
 */
async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

/**
 * Παίρνει εικόνες από Unsplash
 */
async function fetchUnsplashImages(query: string, count: number = 3): Promise<string[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.log('⚠️  No Unsplash API key found, using Lorem Picsum instead');
    return Array.from({ length: count }, (_, i) => 
      `https://picsum.photos/800/1000?random=${Date.now()}_${i}`
    );
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=portrait`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results.map((photo: any) => photo.urls.regular);
  } catch (error: any) {
    console.log('⚠️  Unsplash API failed:', error.message);
    console.log('   Falling back to Lorem Picsum');
    return Array.from({ length: count }, (_, i) => 
      `https://picsum.photos/800/1000?random=${Date.now()}_${i}`
    );
  }
}

/**
 * Ανεβάζει εικόνα στο Supabase Storage
 */
async function uploadToSupabase(imageUrl: string, fileName: string): Promise<string | null> {
  const tempDir = path.join(process.cwd(), 'temp-images');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempPath = path.join(tempDir, fileName);

  try {
    // Κατέβασε την εικόνα
    await downloadImage(imageUrl, tempPath);

    // Ανέβασε στο Supabase
    const fileBuffer = fs.readFileSync(tempPath);
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Πάρε το public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    // Διαγραφή temporary αρχείου
    fs.unlinkSync(tempPath);

    return publicUrl;
  } catch (error: any) {
    console.error(`❌ Failed to upload ${fileName}:`, error.message);
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    return null;
  }
}

/**
 * Βρίσκει το κατάλληλο search term για προϊόν
 */
function getSearchTerm(product: any, category: any): string {
  // Προσπάθησε με το SKU prefix
  const skuPrefix = product.sku.split('-')[0];
  if (SKU_SEARCH_TERMS[skuPrefix]) {
    return SKU_SEARCH_TERMS[skuPrefix];
  }

  // Προσπάθησε με το category slug
  if (category?.slug && SEARCH_TERMS[category.slug]) {
    return SEARCH_TERMS[category.slug][0];
  }

  // Default
  return product.name_en || product.name_el || 'kids clothing';
}

/**
 * Καθαρίζει το temp directory
 */
function cleanup() {
  const tempDir = path.join(process.cwd(), 'temp-images');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function main() {
  console.log('🚀 Ξεκινά το αυτόματο γέμισμα εικόνων προϊόντων...\n');

  try {
    // Πάρε όλα τα προϊόντα από τη βάση
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*, categories(*)')
      .order('created_at', { ascending: true });

    if (productsError) throw productsError;

    if (!products || products.length === 0) {
      console.log('⚠️  Δεν βρέθηκαν προϊόντα στη βάση');
      return;
    }

    console.log(`📦 Βρέθηκαν ${products.length} προϊόντα\n`);

    let processed = 0;
    let skipped = 0;
    let failed = 0;

    for (const product of products) {
      console.log(`\n📸 Επεξεργασία: ${product.name_el} (${product.sku})`);

      // Αν έχει ήδη εικόνες, παράλειψε (optional)
      if (product.images && product.images.length > 0) {
        console.log('   ⏭️  Έχει ήδη εικόνες, παράλειψη...');
        skipped++;
        continue;
      }

      try {
        // Βρες το κατάλληλο search term
        const searchTerm = getSearchTerm(product, product.categories);
        console.log(`   🔍 Αναζήτηση: "${searchTerm}"`);

        // Πάρε 3 εικόνες
        const imageUrls = await fetchUnsplashImages(searchTerm, 3);
        console.log(`   📥 Κατέβασμα ${imageUrls.length} εικόνων...`);

        // Ανέβασε στο Supabase
        const uploadedUrls: string[] = [];
        for (let i = 0; i < imageUrls.length; i++) {
          const fileName = `${product.sku.toLowerCase()}_${i + 1}_${Date.now()}.jpg`;
          const publicUrl = await uploadToSupabase(imageUrls[i], fileName);
          
          if (publicUrl) {
            uploadedUrls.push(publicUrl);
            console.log(`   ✅ Ανέβηκε ${i + 1}/${imageUrls.length}`);
          }
        }

        if (uploadedUrls.length === 0) {
          throw new Error('No images uploaded successfully');
        }

        // Ενημέρωσε το προϊόν στη βάση
        const { error: updateError } = await supabase
          .from('products')
          .update({ images: uploadedUrls })
          .eq('id', product.id);

        if (updateError) throw updateError;

        console.log(`   🎉 Επιτυχία! Προστέθηκαν ${uploadedUrls.length} εικόνες`);
        processed++;

        // Delay για να μην χτυπήσουμε rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        console.error(`   ❌ Αποτυχία: ${error.message}`);
        failed++;
      }
    }

    console.log('\n\n═══════════════════════════════════════');
    console.log('✨ Ολοκληρώθηκε!');
    console.log(`   ✅ Επεξεργάστηκαν: ${processed}`);
    console.log(`   ⏭️  Παραλείφθηκαν: ${skipped}`);
    console.log(`   ❌ Αποτυχίες: ${failed}`);
    console.log('═══════════════════════════════════════\n');

  } catch (error: any) {
    console.error('\n❌ Σφάλμα:', error.message);
  } finally {
    cleanup();
  }
}

main().catch(console.error);

