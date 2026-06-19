/**
 * Image compressor — drops 600KB webp → under 80KB
 * Usage:  node scripts/compress.js <input-folder> <output-folder>
 * Example: node scripts/compress.js C:\Users\me\Desktop\new-images public\products\pp\dual-tone\gold
 */

const sharp = require("sharp");
const fs    = require("fs");
const path  = require("path");

const [,, inputDir, outputDir] = process.argv;

if (!inputDir || !outputDir) {
  console.log("Usage: node scripts/compress.js <input-folder> <output-folder>");
  process.exit(1);
}

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const exts = [".webp", ".jpg", ".jpeg", ".png"];
const files = fs.readdirSync(inputDir).filter(f => exts.includes(path.extname(f).toLowerCase()));

if (files.length === 0) {
  console.log("No images found in", inputDir);
  process.exit(0);
}

(async () => {
  for (const file of files) {
    const inputPath  = path.join(inputDir, file);
    const outputName = path.parse(file).name + ".webp";
    const outputPath = path.join(outputDir, outputName);

    const before = fs.statSync(inputPath).size;

    await sharp(inputPath)
      .resize(900, 900, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 72, effort: 6 })
      .toFile(outputPath);

    const after = fs.statSync(outputPath).size;
    const saved = Math.round((1 - after / before) * 100);
    console.log(`${file}  →  ${outputName}  |  ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB  (${saved}% smaller)`);
  }
  console.log("\nDone. All images saved to:", outputDir);
})();
