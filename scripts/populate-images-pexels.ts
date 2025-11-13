#!/usr/bin/env tsx
/**
 * Γέμισμα εικόνων προϊόντων από Pexels API (ΔΩΡΕΑΝ - ΑΜΕΣΑ)
 * 
 * Usage:
 *   pnpm tsx scripts/populate-images-pexels.ts
 * 
 * Pexels: Δωρεάν API με 200 requests/ώρα
 * Πάρε API key από: https://www.pexels.com/api/
 */

import { createClient } from '@supabase/supabase-js';
import https from 'https';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Λείπουν τα Supabase credentials');
  process.exit(1);
}

if (!PEXELS_API_KEY) {
  console.error('❌ Λείπει το PEXELS_API_KEY');
  console.error('\n📝 Πάρε δωρεάν API key από: https://www.pexels.com/api/');
  console.error('   Πρόσθεσε στο .env.local: PEXELS_API_KEY=your_key_here\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Search terms ανά κατηγορία
const SEARCH_TERMS: Record<string, string> = {
  'boys-clothing': 'children boys clothing fashion',
  'girls-clothing': 'children girls dress fashion',
  'boys-shoes': 'kids boys shoes sneakers',
  'girls-shoes': 'kids girls shoes sandals',
};

// Πολλαπλά search terms για ποικιλία
const SKU_TERMS: Record<string, string[]> = {
  'BC': ['boys clothing casual', 'kids boys outfit', 'children boys fashion', 'boys wear style'],
  'GC': ['girls dress casual', 'kids girls outfit', 'children girls fashion', 'girls wear style'],
  'BS': ['boys shoes casual', 'kids boys sneakers', 'children footwear boys', 'boys boots casual'],
  'GS': ['girls shoes casual', 'kids girls sandals', 'children footwear girls', 'girls boots style'],
};

/**
 * Κατεβάζει εικόνα από URL
 */
async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const request = https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          fs.unlinkSync(filepath);
          downloadImage(redirectUrl, filepath).then(resolve).catch(reject);
          return;
        }
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });
    request.on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

/**
 * Παίρνει εικόνες από Pexels με randomization
 */
async function fetchPexelsImages(query: string, count: number = 3, productIndex: number = 0): Promise<string[]> {
  try {
    // Χρήση διαφορετικής σελίδας για κάθε προϊόν (1-10)
    const page = (productIndex % 10) + 1;
    
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&page=${page}&orientation=portrait`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.photos || data.photos.length === 0) {
      throw new Error('No photos found');
    }

    // Παίρνουμε τυχαίες εικόνες από τα αποτελέσματα
    const shuffled = data.photos.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    return selected.map((photo: any) => photo.src.large);
  } catch (error: any) {
    console.error(`   ❌ Pexels API error: ${error.message}`);
    throw error;
  }
}

/**
 * Ανεβάζει εικόνα στο Supabase Storage
 */
async function uploadToSupabase(
  imageUrl: string,
  fileName: string,
  tempDir: string
): Promise<string | null> {
  const tempPath = path.join(tempDir, fileName);

  try {
    await downloadImage(imageUrl, tempPath);
    const fileBuffer = fs.readFileSync(tempPath);

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    fs.unlinkSync(tempPath);
    return publicUrl;
  } catch (error: any) {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    throw error;
  }
}

/**
 * Βρίσκει το search term για προϊόν με ποικιλία
 */
function getSearchTerm(product: any, category: any, productIndex: number): string {
  // Από SKU prefix με rotation
  const skuPrefix = product.sku.split('-')[0];
  if (SKU_TERMS[skuPrefix]) {
    const terms = SKU_TERMS[skuPrefix];
    return terms[productIndex % terms.length];
  }

  // Από category slug
  if (category?.slug && SEARCH_TERMS[category.slug]) {
    return SEARCH_TERMS[category.slug];
  }

  // Default
  return 'children clothing fashion';
}

async function main() {
  const tempDir = path.join(process.cwd(), 'temp-pexels');

  try {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*, categories(*)')
      .order('created_at', { ascending: true });

    if (productsError) throw productsError;
    if (!products || products.length === 0) {
      console.error('⚠️  Δεν βρέθηκαν προϊόντα');
      return;
    }

    let productIndex = 0;

    for (const product of products) {
      // Παράλειψη αν έχει ήδη εικόνες
      if (product.images && product.images.length > 0) {
        continue;
      }

      try {
        const searchTerm = getSearchTerm(product, product.categories, productIndex);

        const imageUrls = await fetchPexelsImages(searchTerm, 3, productIndex);

        const uploadedUrls: string[] = [];
        for (let i = 0; i < imageUrls.length; i++) {
          const fileName = `${product.sku.toLowerCase()}_${i + 1}_${Date.now()}.jpg`;
          
          try {
            const publicUrl = await uploadToSupabase(imageUrls[i], fileName, tempDir);
            if (publicUrl) {
              uploadedUrls.push(publicUrl);
            }
          } catch (err: any) {
            console.error(`   ⚠️  Σφάλμα ${i + 1}: ${err.message}`);
          }

          await new Promise(resolve => setTimeout(resolve, 300));
        }

        if (uploadedUrls.length === 0) {
          throw new Error('Καμία εικόνα δεν ανέβηκε');
        }

        const { error: updateError } = await supabase
          .from('products')
          .update({ images: uploadedUrls })
          .eq('id', product.id);

        if (updateError) throw updateError;

        productIndex++;

        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        console.error(`   ❌ Αποτυχία: ${error.message}`);
      }
    }

  } catch (error: any) {
    console.error('\n❌ Σφάλμα:', error.message);
  } finally {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

process.on('SIGINT', () => {
  const tempDir = path.join(process.cwd(), 'temp-pexels');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  process.exit(0);
});

main().catch(console.error);

