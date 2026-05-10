const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const PRODUCTS_DIR = path.join(__dirname, "../public/products");
const OUT_DIR = path.join(__dirname, "../public/products-resized");
const MAX_WIDTH = 500;

async function resizeAll(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(PRODUCTS_DIR, full);
    const out = path.join(OUT_DIR, rel);

    if (entry.isDirectory()) {
      fs.mkdirSync(out, { recursive: true });
      await resizeAll(full);
    } else if (entry.name.endsWith(".webp")) {
      const meta = await sharp(full).metadata();
      if (meta.width > MAX_WIDTH) {
        const input = fs.readFileSync(full);
        const buf = await sharp(input).resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
        fs.writeFileSync(out, buf);
        console.log(`✓ ${rel}: ${meta.width}px → ${MAX_WIDTH}px (${Math.round(fs.statSync(full).size/1024)}KB → ${Math.round(buf.length/1024)}KB)`);
      } else {
        fs.copyFileSync(full, out);
      }
    }
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });
resizeAll(PRODUCTS_DIR).then(() => {
  console.log("\nDone! Now run:");
  console.log('  Remove-Item -Recurse public\\products');
  console.log('  Rename-Item public\\products-resized products');
}).catch(console.error);
