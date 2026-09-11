const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "assets", "brand", "icon-mark-source.png");
const OUT_DIR = path.join(__dirname, "..", "_icon-build");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function keyOutBlack(buf) {
  const img = sharp(buf).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);
  const LO = 12, HI = 60;
  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    const a = data[i * channels + 3];
    const lum = Math.max(r, g, b);
    let ramp;
    if (lum <= LO) ramp = 0;
    else if (lum >= HI) ramp = 255;
    else ramp = Math.round(((lum - LO) / (HI - LO)) * 255);
    const newA = Math.round((ramp * a) / 255);
    out[i * 4] = r;
    out[i * 4 + 1] = g;
    out[i * 4 + 2] = b;
    out[i * 4 + 3] = newA;
  }
  return sharp(out, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + 16 * count;
  let offset = headerSize;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  const imageBuffers = [];
  for (const { size, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += buffer.length;
    dirEntries.push(entry);
    imageBuffers.push(buffer);
  }
  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

async function main() {
  const raw = fs.readFileSync(SRC);
  const keyed = await keyOutBlack(raw);

  const trimmed = await sharp(keyed).trim({ threshold: 5 }).toBuffer();
  const meta = await sharp(trimmed).metadata();
  const side = Math.max(meta.width, meta.height);
  const padded = Math.round(side * 1.32);

  const squared = await sharp(trimmed)
    .resize({
      width: padded,
      height: padded,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(OUT_DIR, "mark-master.png"), squared);

  async function sizeTo(n, opaqueBg) {
    let pipeline = sharp(squared).resize(n, n, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
    if (opaqueBg) pipeline = pipeline.flatten({ background: { r: 10, g: 10, b: 10 } });
    return pipeline.png().toBuffer();
  }

  const icon16 = await sizeTo(16, false);
  const icon32 = await sizeTo(32, false);
  const icon48 = await sizeTo(48, false);
  fs.writeFileSync(path.join(OUT_DIR, "favicon.ico"), buildIco([
    { size: 16, buffer: icon16 },
    { size: 32, buffer: icon32 },
    { size: 48, buffer: icon48 },
  ]));

  fs.writeFileSync(path.join(OUT_DIR, "icon1.png"), await sizeTo(96, false));
  fs.writeFileSync(path.join(OUT_DIR, "apple-icon.png"), await sizeTo(180, true));
  fs.writeFileSync(path.join(OUT_DIR, "web-app-manifest-192x192.png"), await sizeTo(192, true));
  fs.writeFileSync(path.join(OUT_DIR, "web-app-manifest-512x512.png"), await sizeTo(512, true));

  console.log("done", { padded, meta });
}

main().catch(e => { console.error(e); process.exit(1); });
