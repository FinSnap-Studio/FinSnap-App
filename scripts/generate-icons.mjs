import sharp from "sharp";
import { mkdir } from "node:fs/promises";

await mkdir("public/icons", { recursive: true });

const svgBase = (size) =>
  Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.16}" fill="#3d6b8a"/>
  <text
    x="${size / 2}" y="${size * 0.68}"
    font-family="system-ui,-apple-system,sans-serif"
    font-weight="800"
    font-size="${size * 0.47}"
    fill="white"
    text-anchor="middle"
    letter-spacing="-${size * 0.016}"
  >FS</text>
</svg>`);

await sharp(svgBase(192)).png().toFile("public/icons/icon-192.png");
await sharp(svgBase(512)).png().toFile("public/icons/icon-512.png");

console.log("Icons generated: public/icons/icon-192.png, icon-512.png");
