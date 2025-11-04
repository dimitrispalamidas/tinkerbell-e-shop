#!/usr/bin/env tsx
/**
 * Upload images to Supabase Storage
 * 
 * Usage:
 *   npx tsx scripts/upload-images.ts
 * 
 * Place your images in:
 *   - public/sample-images/products/   (for product images)
 *   - public/sample-images/gallery/    (for gallery images)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadImage(bucket: string, filePath: string, fileName: string) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        contentType: getMimeType(fileName),
        upsert: true, // Replace if exists
      });

    if (error) throw error;

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
    console.log(`✅ Uploaded: ${fileName} -> ${publicUrl}`);
    
    return publicUrl;
  } catch (error: any) {
    console.error(`❌ Failed to upload ${fileName}:`, error.message);
    return null;
  }
}

function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

async function uploadDirectory(bucket: string, directory: string) {
  if (!fs.existsSync(directory)) {
    console.log(`⚠️  Directory not found: ${directory}`);
    console.log(`   Create it and add some images!`);
    return [];
  }

  const files = fs.readdirSync(directory).filter(f => 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
  );

  if (files.length === 0) {
    console.log(`⚠️  No images found in ${directory}`);
    return [];
  }

  console.log(`\n📁 Uploading ${files.length} images to '${bucket}' bucket...`);
  
  const urls: string[] = [];
  for (const file of files) {
    const filePath = path.join(directory, file);
    const url = await uploadImage(bucket, filePath, file);
    if (url) urls.push(url);
  }

  return urls;
}

async function main() {
  console.log('🚀 Starting image upload...\n');

  // Upload product images
  const productUrls = await uploadDirectory(
    'products',
    path.join(process.cwd(), 'public/sample-images/products')
  );

  // Upload gallery images
  const galleryUrls = await uploadDirectory(
    'gallery',
    path.join(process.cwd(), 'public/sample-images/gallery')
  );

  console.log('\n✨ Upload complete!');
  console.log(`   Products: ${productUrls.length} images`);
  console.log(`   Gallery: ${galleryUrls.length} images`);
  
  if (productUrls.length > 0) {
    console.log('\n💡 Next steps:');
    console.log('   1. Update product images in Supabase:');
    console.log('      UPDATE products SET images = ARRAY[\'url1\', \'url2\'] WHERE sku = \'SKU-001\';');
    console.log('   2. Update gallery images:');
    console.log('      UPDATE gallery_items SET image_url = \'url\' WHERE id = \'...\';');
  }
}

main().catch(console.error);

