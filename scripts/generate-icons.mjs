/**
 * Generates minimal placeholder PNG icons for the Stream Deck manifest.
 * For production, replace with professionally designed icons.
 *
 * Run with: node scripts/generate-icons.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";
import { deflateSync } from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMGS_DIR = join(__dirname, "..", "com.claudegauge.usage.sdPlugin", "imgs");
mkdirSync(IMGS_DIR, { recursive: true });

/**
 * Creates a minimal valid PNG with a solid color.
 * This is a simple approach that creates small colored squares as placeholders.
 */
function createPng(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);    // bit depth
  ihdrData.writeUInt8(2, 9);    // color type (RGB)
  ihdrData.writeUInt8(0, 10);   // compression
  ihdrData.writeUInt8(0, 11);   // filter
  ihdrData.writeUInt8(0, 12);   // interlace
  const ihdr = makeChunk("IHDR", ihdrData);

  // IDAT chunk - raw image data
  const rawData = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const offset = y * (1 + width * 3);
    rawData[offset] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const px = offset + 1 + x * 3;
      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
    }
  }
  const compressed = deflateSync(rawData);
  const idat = makeChunk("IDAT", compressed);

  // IEND chunk
  const iend = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, "ascii");
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Dark blue-purple background color (#1a1a2e)
const icons = [
  { name: "plugin-icon.png", size: 72 },
  { name: "plugin-icon@2x.png", size: 144 },
  { name: "action-combined.png", size: 72 },
  { name: "action-combined@2x.png", size: 144 },
  { name: "action-7day.png", size: 72 },
  { name: "action-7day@2x.png", size: 144 },
  { name: "action-5hour.png", size: 72 },
  { name: "action-5hour@2x.png", size: 144 },
];

for (const icon of icons) {
  const png = createPng(icon.size, icon.size, 0x1a, 0x1a, 0x2e);
  writeFileSync(join(IMGS_DIR, icon.name), png);
  console.log(`Created ${icon.name} (${icon.size}x${icon.size})`);
}

console.log(`\nDone! ${icons.length} icons created in ${IMGS_DIR}`);
console.log("Note: These are placeholder icons. Replace with designed icons for production.");
