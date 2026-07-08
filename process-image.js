const Jimp = require("jimp");
const path = require("path");

async function removeBackground() {
  const image = await Jimp.read(path.join(__dirname, "public/IMG_4121.png"));
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    // Detect white/light grey background
    // Background pixels are high brightness AND low saturation (not colourful)
    const brightness = (r + g + b) / 3;
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const saturation = maxC === 0 ? 0 : (maxC - minC) / maxC;

    // White/light grey: bright AND desaturated
    if (brightness > 200 && saturation < 0.18) {
      this.bitmap.data[idx + 3] = 0; // fully transparent
    } else if (brightness > 170 && saturation < 0.12) {
      // smooth edge
      const factor = (brightness - 170) / 30;
      this.bitmap.data[idx + 3] = Math.round(255 * (1 - factor));
    }
    // Gold pixels: keep fully opaque (already fully opaque by default)
  });

  await image.writeAsync(path.join(__dirname, "public/logo-transparent.png"));
  console.log("✅ logo-transparent.png saved to public/");
}

removeBackground().catch(console.error);
