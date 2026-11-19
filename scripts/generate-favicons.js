const fs = require('fs');
const sharp = require('sharp');

async function makeIcons() {
  const src = 'public/images/tsop-crest.png';

  // 1. 512x512 app icon
  await sharp(src)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile('src/app/icon.png');
  console.log('Generated src/app/icon.png');

  // 2. 180x180 apple-icon
  await sharp(src)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile('src/app/apple-icon.png');
  console.log('Generated src/app/apple-icon.png');

  // 3. Generate PNGs for ICO (16, 32, 48)
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    sizes.map((s) =>
      sharp(src)
        .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
    )
  );

  // Pack into ICO container
  const count = sizes.length;
  const headerLen = 6 + count * 16;
  let offset = headerLen;
  const headers = [];

  for (let i = 0; i < count; i++) {
    const s = sizes[i];
    const buf = pngBuffers[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(s >= 256 ? 0 : s, 0); // width
    entry.writeUInt8(s >= 256 ? 0 : s, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(buf.length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset
    offset += buf.length;
    headers.push(entry);
  }

  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // reserved
  icoHeader.writeUInt16LE(1, 2); // icon type
  icoHeader.writeUInt16LE(count, 4); // count

  const icoBuf = Buffer.concat([icoHeader, ...headers, ...pngBuffers]);
  fs.writeFileSync('src/app/favicon.ico', icoBuf);
  fs.writeFileSync('public/favicon.ico', icoBuf);
  console.log('Generated favicon.ico in src/app and public (16, 32, 48px)');
}

makeIcons().catch((err) => {
  console.error(err);
  process.exit(1);
});
