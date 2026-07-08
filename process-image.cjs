const { Jimp } = require("jimp");
const path = require("path");

async function removeBackground() {
  console.log("Reading image...");
  const image = await Jimp.read(path.join(__dirname, "public/IMG_4121.png"));
  console.log("Image loaded:", image.bitmap.width, "x", image.bitmap.height);

  const { width, height } = image.bitmap;

  image.scan(0, 0, width, height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    const brightness = (r + g + b) / 3;
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const saturation = maxC === 0 ? 0 : (maxC - minC) / maxC;

    // Kill white/light grey background pixels
    if (brightness > 200 && saturation < 0.18) {
      this.bitmap.data[idx + 3] = 0; // fully transparent
    } else if (brightness > 168 && saturation < 0.15) {
      // Smooth anti-aliased transition
      const factor = (brightness - 168) / 32;
      this.bitmap.data[idx + 3] = Math.round(255 * (1 - factor));
    }
    // Gold pixels: untouched, stay fully opaque
  });

  const outPath = path.join(__dirname, "public/logo-transparent.png");
  await image.write(outPath);
  console.log("✅ Done! Saved to:", outPath);
}

removeBackground().catch(console.error);
