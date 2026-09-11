const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const files = [
  'public/products/tst/single-tone/black/1.webp',
  'public/products/tst/single-tone/sapphire-blue/1.webp',
  'public/products/tst/single-tone/white/1.webp',
  'public/products/tst/single-tone/deep-blue/1.webp',
];

// ── Step 1: scan the centre column to find text rows ────────────────────────
// Text pixels are much brighter/darker than the surrounding dial.
// We scan y=650..1050 at x=543 (horizontal centre) and log brightness.
async function scanBrightness(file) {
  const rows = [];
  for (let y = 650; y <= 1050; y += 4) {
    const buf = await sharp(file)
      .extract({ left: 541, top: y, width: 3, height: 1 })
      .raw()
      .toBuffer();
    const brightness = Math.round((buf[0] + buf[1] + buf[2]) / 3);
    rows.push({ y, brightness });
  }
  return rows;
}

// ── Step 2: sample dial colour from a known clean area ──────────────────────
async function sampleColor(file, x, y, size = 5) {
  const buf = await sharp(file)
    .extract({ left: x, top: y, width: size, height: size })
    .raw()
    .toBuffer();
  let r = 0, g = 0, b = 0, n = size * size;
  for (let i = 0; i < buf.length; i += 3) { r += buf[i]; g += buf[i+1]; b += buf[i+2]; }
  return { r: Math.round(r/n), g: Math.round(g/n), b: Math.round(b/n) };
}

// ── Step 3: paint SVG rects ─────────────────────────────────────────────────
async function paintRects(file, rects) {
  const svgParts = rects.map(({ left, top, width, height, color }) =>
    `<rect x="${left}" y="${top}" width="${width}" height="${height}" fill="rgb(${color.r},${color.g},${color.b})"/>`
  ).join('');
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1086" height="1448">${svgParts}</svg>`
  );
  const inputBuf = fs.readFileSync(file);
  const outFile = file.replace('/1.webp', '/1_fixed.webp');
  await sharp(inputBuf)
    .composite([{ input: svg, top: 0, left: 0 }])
    .webp({ quality: 85 })
    .toFile(outFile);
  return outFile;
}

async function main() {
  // --- DIAGNOSTIC PASS: print brightness map for the black dial ---
  console.log('\n=== Brightness scan (black dial, centre column) ===');
  const scan = await scanBrightness(files[0]);
  scan.forEach(({ y, brightness }) => {
    const bar = '█'.repeat(Math.round(brightness / 8));
    console.log(`y=${y.toString().padStart(4)}  ${brightness.toString().padStart(3)}  ${bar}`);
  });

  // --- APPLY FIXES ---
  // Coordinates tuned after seeing the brightness map above.
  // Each watch needs:
  //   (A) a clean dial sample point (avoids the watch hands near x=543)
  //   (B) two rects: one for PRX, one for SWISS MADE
  //
  // Strategy: sample colour from x=400 (left of centre, away from hands)
  // at a y that's cleanly between the 1853 text and PRX text.

  for (const file of files) {
    const name = file.split('/').slice(-2).join('/');
    console.log(`\nProcessing ${name}…`);

    // Sample background colour from the clean dial area (below "1853", above PRX)
    const bgColor = await sampleColor(file, 400, 795, 5);
    console.log(`  BG colour: rgb(${bgColor.r},${bgColor.g},${bgColor.b})`);

    // PRX is confirmed covered by y=758-840 (first successful attempt).
    // SWISS MADE is just below PRX. Use generous rect heights; the dial
    // background is uniform so invisible paint = zero visual artefact.
    // Width is kept narrow enough to stay inside the circular dial boundary.
    const rects = [
      { left: 398, top: 754, width: 292, height: 136, color: bgColor }, // PRX  y=754-890
      { left: 352, top: 878, width: 384, height: 74,  color: bgColor }, // SWISS MADE y=878-952
    ];

    const out = await paintRects(file, rects);
    console.log(`  Written: ${out}`);
  }
  console.log('\nDone. Check the *_fixed.webp files visually before replacing originals.');
}

main().catch(e => { console.error(e); process.exit(1); });
