const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.join(__dirname, "..");
process.chdir(PROJECT_ROOT);
sharp.cache(false); // prevent libvips cache OOM when processing many files
const PUBLIC_DIR = "public";

const PRODUCT_MAX_W = 900;
const HERO_MAX_W = 1400;
const QUALITY = 78;
const EFFORT = 6;

async function processFile(filePath) {
  const isHero = filePath.includes("hero");
  const maxW = isHero ? HERO_MAX_W : PRODUCT_MAX_W;

  const inputBuffer = fs.readFileSync(filePath);
  const originalSize = inputBuffer.length;

  const meta = await sharp(inputBuffer).metadata();
  let pipeline = sharp(inputBuffer).rotate();

  if (meta.width && meta.width > maxW) {
    pipeline = pipeline.resize(maxW, null, { withoutEnlargement: true });
  }

  const outBuffer = await pipeline
    .webp({ quality: QUALITY, effort: EFFORT })
    .toBuffer();

  const label = filePath.replace(/\\/g, "/");
  if (outBuffer.length < originalSize) {
    fs.writeFileSync(filePath, outBuffer);
    const saved = ((originalSize - outBuffer.length) / 1024).toFixed(1);
    console.log(`  ✓ ${label}  ${(originalSize/1024).toFixed(0)}KB → ${(outBuffer.length/1024).toFixed(0)}KB  (−${saved}KB)`);
  } else {
    console.log(`  ~ ${label}  already optimal (${(originalSize/1024).toFixed(0)}KB)`);
  }
}

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, results);
    } else if (/\.(webp|jpg|jpeg|png)$/i.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

(async () => {
  const targets = [
    path.join(PUBLIC_DIR, "products"),
    path.join(PUBLIC_DIR, "hero"),
  ].filter(d => fs.existsSync(d));

  const files = targets.flatMap(d => walk(d));
  console.log(`Processing ${files.length} image(s)...\n`);

  let ok = 0, skipped = 0, failed = 0;
  for (const f of files) {
    try {
      await processFile(f);
      ok++;
    } catch (e) {
      console.error(`  ✗ ${f.replace(/\\/g, "/")}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\nDone. ${ok} processed, ${failed} failed.`);
})();
