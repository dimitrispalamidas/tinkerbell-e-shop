const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createOGImage() {
  const inputImage = path.join(__dirname, '../public/hero-children2.jpg');
  const outputImage = path.join(__dirname, '../public/og-homepage.jpg');

  // Create SVG overlay with text
  const svgOverlay = `
    <svg width="1200" height="630">
      <!-- Dark gradient overlay -->
      <defs>
        <linearGradient id="darkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0.6" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#darkGrad)"/>
      
      <!-- Main Title -->
      <text x="600" y="200" 
            font-family="Arial, sans-serif" 
            font-size="96" 
            font-weight="bold" 
            fill="white" 
            text-anchor="middle"
            style="filter: drop-shadow(0px 4px 20px rgba(0,0,0,0.8))">
        Τινκερμπελ
      </text>
      
      <!-- Subtitle -->
      <text x="600" y="280" 
            font-family="Arial, sans-serif" 
            font-size="42" 
            font-weight="500" 
            fill="white" 
            text-anchor="middle"
            style="filter: drop-shadow(0px 2px 12px rgba(0,0,0,0.8))">
        Παιδικά &amp; Εφηβικά Ρούχα και Παπούτσια
      </text>
      
      <!-- Description Line 1 -->
      <text x="600" y="360" 
            font-family="Arial, sans-serif" 
            font-size="28" 
            fill="white" 
            text-anchor="middle"
            style="filter: drop-shadow(0px 2px 8px rgba(0,0,0,0.8))">
        Ανακαλύψτε τη μοναδική μας συλλογή από
      </text>
      
      <!-- Description Line 2 -->
      <text x="600" y="400" 
            font-family="Arial, sans-serif" 
            font-size="28" 
            fill="white" 
            text-anchor="middle"
            style="filter: drop-shadow(0px 2px 8px rgba(0,0,0,0.8))">
        παιδικά ρούχα, παπούτσια και αξεσουάρ
      </text>
    </svg>
  `;

  try {
    // Load the original image and resize to 1200x630
    const image = await sharp(inputImage)
      .resize(1200, 630, {
        fit: 'cover',
        position: 'center'
      })
      .toBuffer();

    // Composite the SVG overlay on top
    await sharp(image)
      .composite([
        {
          input: Buffer.from(svgOverlay),
          top: 0,
          left: 0,
        }
      ])
      .jpeg({ quality: 90 })
      .toFile(outputImage);

    console.log('✅ OG image created successfully at:', outputImage);
  } catch (error) {
    console.error('❌ Error creating OG image:', error);
  }
}

createOGImage();

