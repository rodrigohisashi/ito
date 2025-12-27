const sharp = require('sharp');
const path = require('path');

const sizes = [192, 512];
const outputDir = path.join(__dirname, '../client/public/icons');

const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6"/>
      <stop offset="100%" style="stop-color:#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="#0f0a1e"/>
  <text x="256" y="320" text-anchor="middle" fill="url(#grad)" font-family="Arial Black, sans-serif" font-size="192" font-weight="bold">ITO</text>
</svg>
`;

async function generateIcons() {
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}.png`);
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated: icon-${size}.png`);
  }
}

generateIcons().catch(console.error);
