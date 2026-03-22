/**
 * redact.ts — Apply gaussian blur to regions of an image.
 *
 * Usage:
 *   tsx scripts/redact.ts <input> <output> '<regions-json>'
 *
 * regions-json is an array of {x, y, width, height} objects (pixels).
 *
 * Example:
 *   tsx scripts/redact.ts raw/img.png out/img.png '[{"x":100,"y":200,"width":300,"height":40}]'
 */
import sharp from "sharp";

interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function redact(
  inputPath: string,
  outputPath: string,
  regions: Region[],
) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const imgWidth = metadata.width!;
  const imgHeight = metadata.height!;

  // Clamp regions to image bounds
  const clamped = regions.map((r) => ({
    x: Math.max(0, Math.round(r.x)),
    y: Math.max(0, Math.round(r.y)),
    width: Math.min(Math.round(r.width), imgWidth - Math.max(0, Math.round(r.x))),
    height: Math.min(Math.round(r.height), imgHeight - Math.max(0, Math.round(r.y))),
  })).filter((r) => r.width > 0 && r.height > 0);

  if (clamped.length === 0) {
    // No regions to blur — just copy
    await sharp(inputPath).toFile(outputPath);
    console.log("No valid regions — copied image as-is.");
    return;
  }

  // Create pixelated + blurred overlays for each region
  const composites = await Promise.all(
    clamped.map(async (r) => {
      // Shrink to very few pixels, then scale back up for mosaic effect
      const tinyW = Math.max(1, Math.round(r.width / 20));
      const tinyH = Math.max(1, Math.round(r.height / 20));
      const pixelated = await sharp(inputPath)
        .extract({ left: r.x, top: r.y, width: r.width, height: r.height })
        .resize(tinyW, tinyH, { kernel: sharp.kernel.nearest })
        .resize(r.width, r.height, { kernel: sharp.kernel.nearest })
        .blur(3)
        .toBuffer();
      return { input: pixelated, left: r.x, top: r.y };
    }),
  );

  await sharp(inputPath).composite(composites).toFile(outputPath);
  console.log(`Blurred ${clamped.length} region(s) → ${outputPath}`);
}

// --- CLI ---
const [inputPath, outputPath, regionsJson] = process.argv.slice(2);

if (!inputPath || !outputPath || !regionsJson) {
  console.error(
    "Usage: tsx scripts/redact.ts <input> <output> '<regions-json>'",
  );
  process.exit(1);
}

const regions: Region[] = JSON.parse(regionsJson);
redact(inputPath, outputPath, regions).catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
