#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import https from 'https';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

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

async function fetchPexelsImages(): Promise<string[]> {
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=kids boys sneakers footwear&per_page=10&page=3&orientation=portrait`,
    { headers: { 'Authorization': PEXELS_API_KEY } }
  );
  const data = await response.json();
  const shuffled = data.photos.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((p: any) => p.src.large);
}

async function uploadToSupabase(imageUrl: string, fileName: string, tempDir: string): Promise<string | null> {
  const tempPath = path.join(tempDir, fileName);
  try {
    await downloadImage(imageUrl, tempPath);
    const fileBuffer = fs.readFileSync(tempPath);
    const { error } = await supabase.storage.from('products').upload(fileName, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
    fs.unlinkSync(tempPath);
    return publicUrl;
  } catch (error: any) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    throw error;
  }
}

async function main() {
  const tempDir = path.join(process.cwd(), 'temp-fix');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const products = ['BS-009', 'BS-010'];
  
  for (const sku of products) {
    console.log(`\n📸 Fixing ${sku}...`);
    const imageUrls = await fetchPexelsImages();
    const uploadedUrls: string[] = [];

    for (let i = 0; i < imageUrls.length; i++) {
      const fileName = `${sku.toLowerCase()}_${i + 1}_${Date.now()}.jpg`;
      const publicUrl = await uploadToSupabase(imageUrls[i], fileName, tempDir);
      if (publicUrl) {
        uploadedUrls.push(publicUrl);
        console.log(`   ✅ ${i + 1}/3`);
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    await supabase.from('products').update({ images: uploadedUrls }).eq('sku', sku);
    console.log(`   🎉 Done!`);
  }

  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log('\n✅ All fixed!');
}

main().catch(console.error);

