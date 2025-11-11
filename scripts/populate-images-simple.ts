#!/usr/bin/env tsx
/**
 * Απλό script για γέμισμα εικόνων προϊόντων με placeholder images
 * 
 * Usage:
 *   pnpm tsx scripts/populate-images-simple.ts
 * 
 * Χρησιμοποιεί Lorem Picsum (δωρεάν, χωρίς API key)
 */

import { createClient } from '@supabase/supabase-js';
import https from 'https';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Λείπουν τα Supabase credentials στο .env.local');
  console.log('   Πρόσθεσε:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=your-url');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Κατεβάζει εικόνα από URL
 */
async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    const request = https.get(url, (response) => {
      // Αν έχει redirect, ακολούθησε το
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
 * Ανεβάζει εικόνα στο Supabase Storage
 */
async function uploadToSupabase(
  imageUrl: string, 
  fileName: string,
  tempDir: string
): Promise<string | null> {
  const tempPath = path.join(tempDir, fileName);

  try {
    // Κατέβασε την εικόνα
    await downloadImage(imageUrl, tempPath);

    // Διάβασε το αρχείο
    const fileBuffer = fs.readFileSync(tempPath);

    // Ανέβασε στο Supabase
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
    console.error(`   ❌ Σφάλμα ανεβάσματος: ${error.message}`);
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    return null;
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   📸 ΑΥΤΟΜΑΤΟ ΓΕΜΙΣΜΑ ΕΙΚΟΝΩΝ ΠΡΟΪΟΝΤΩΝ           ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const tempDir = path.join(process.cwd(), 'temp-images');
  
  try {
    // Δημιούργησε temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Πάρε όλα τα προϊόντα
    console.log('📦 Φόρτωση προϊόντων από τη βάση...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, sku, name_el, name_en, images')
      .order('created_at', { ascending: true });

    if (productsError) throw productsError;

    if (!products || products.length === 0) {
      console.log('\n⚠️  Δεν βρέθηκαν προϊόντα στη βάση');
      console.log('   Τρέξε πρώτα το seed script για να προσθέσεις δείγματα προϊόντων');
      return;
    }

    console.log(`✅ Βρέθηκαν ${products.length} προϊόντα\n`);

    // Ρώτα τον χρήστη αν θέλει να αντικαταστήσει τις υπάρχουσες
    const productsWithImages = products.filter(p => p.images && p.images.length > 0);
    const productsWithoutImages = products.filter(p => !p.images || p.images.length === 0);

    if (productsWithImages.length > 0) {
      console.log(`ℹ️  ${productsWithImages.length} προϊόντα έχουν ήδη εικόνες`);
      console.log(`ℹ️  ${productsWithoutImages.length} προϊόντα δεν έχουν εικόνες\n`);
    }

    let processed = 0;
    let skipped = 0;
    let failed = 0;

    // Επεξεργασία κάθε προϊόντος
    for (const product of products) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📸 ${product.name_el} (${product.sku})`);

      // Αν έχει ήδη εικόνες, παράλειψε
      if (product.images && product.images.length > 0) {
        console.log(`   ⏭️  Παραλείφθηκε (έχει ήδη ${product.images.length} εικόνες)`);
        skipped++;
        continue;
      }

      try {
        const uploadedUrls: string[] = [];

        // Κατέβασε και ανέβασε 3 εικόνες
        for (let i = 0; i < 3; i++) {
          const imageUrl = `https://picsum.photos/800/1000?random=${Date.now()}_${product.sku}_${i}`;
          const fileName = `${product.sku.toLowerCase()}_${i + 1}_${Date.now()}.jpg`;

          console.log(`   📥 Κατέβασμα εικόνας ${i + 1}/3...`);
          const publicUrl = await uploadToSupabase(imageUrl, fileName, tempDir);

          if (publicUrl) {
            uploadedUrls.push(publicUrl);
            console.log(`   ✅ Ανέβηκε ${i + 1}/3`);
          } else {
            console.log(`   ⚠️  Αποτυχία ${i + 1}/3`);
          }

          // Μικρό delay ανάμεσα στα downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (uploadedUrls.length === 0) {
          throw new Error('Καμία εικόνα δεν ανέβηκε επιτυχώς');
        }

        // Ενημέρωσε τη βάση
        const { error: updateError } = await supabase
          .from('products')
          .update({ images: uploadedUrls })
          .eq('id', product.id);

        if (updateError) throw updateError;

        console.log(`   🎉 Επιτυχία! Προστέθηκαν ${uploadedUrls.length} εικόνες`);
        processed++;

      } catch (error: any) {
        console.error(`   ❌ Αποτυχία: ${error.message}`);
        failed++;
      }
    }

    // Αποτελέσματα
    console.log('\n\n╔═══════════════════════════════════════════════════════╗');
    console.log('║                  📊 ΑΠΟΤΕΛΕΣΜΑΤΑ                    ║');
    console.log('╠═══════════════════════════════════════════════════════╣');
    console.log(`║  ✅ Επεξεργάστηκαν:  ${processed.toString().padEnd(31)}║`);
    console.log(`║  ⏭️  Παραλείφθηκαν:  ${skipped.toString().padEnd(31)}║`);
    console.log(`║  ❌ Αποτυχίες:       ${failed.toString().padEnd(31)}║`);
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    if (processed > 0) {
      console.log('💡 Οι εικόνες ενημερώθηκαν αυτόματα στη βάση!');
      console.log('   Μπορείς να τις δεις στο admin panel: /admin/products\n');
    }

  } catch (error: any) {
    console.error('\n❌ Σφάλμα:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  } finally {
    // Καθαρισμός
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

// Χειρισμός interruption
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Διακόπηκε από τον χρήστη');
  const tempDir = path.join(process.cwd(), 'temp-images');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  process.exit(0);
});

main().catch(console.error);

