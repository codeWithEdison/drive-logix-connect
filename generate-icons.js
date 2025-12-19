import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Android icon sizes (in pixels)
const iconSizes = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192,
};

// Splash screen sizes (landscape and portrait)
const splashSizes = {
  "drawable-mdpi": { w: 320, h: 200 },
  "drawable-hdpi": { w: 480, h: 320 },
  "drawable-xhdpi": { w: 720, h: 480 },
  "drawable-xxhdpi": { w: 960, h: 640 },
  "drawable-xxxhdpi": { w: 1280, h: 853 },
};

// Use lovewaylogistic.png as the app icon
const logoPath = path.join(__dirname, "public", "lovewaylogistic.png");
const androidResPath = path.join(
  __dirname,
  "android",
  "app",
  "src",
  "main",
  "res"
);

async function generateIcons() {
  try {
    // Check if logo exists
    if (!fs.existsSync(logoPath)) {
      console.error(`Logo not found at: ${logoPath}`);
      process.exit(1);
    }

    console.log("Generating Android app icons from lovewaylogistic.png...");

    // Generate launcher icons
    for (const [folder, size] of Object.entries(iconSizes)) {
      const folderPath = path.join(androidResPath, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Generate foreground icon (just the logo with transparent background)
      await sharp(logoPath)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(path.join(folderPath, "ic_launcher_foreground.png"));

      // Generate full icon (logo on white background for better visibility)
      await sharp(logoPath)
        .resize(size, size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png()
        .toFile(path.join(folderPath, "ic_launcher.png"));

      // Generate round icon
      await sharp(logoPath)
        .resize(size, size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png()
        .toFile(path.join(folderPath, "ic_launcher_round.png"));

      console.log(`✓ Generated icons for ${folder} (${size}x${size})`);
    }

    console.log("\nGenerating splash screen images...");

    // Generate splash screens (portrait and landscape)
    for (const [folder, dimensions] of Object.entries(splashSizes)) {
      const density = folder.split("-")[1]; // e.g., 'mdpi', 'hdpi', etc.
      const portraitFolder = `drawable-port-${density}`;
      const landscapeFolder = `drawable-land-${density}`;

      const portraitPath = path.join(androidResPath, portraitFolder);
      const landscapePath = path.join(androidResPath, landscapeFolder);

      if (!fs.existsSync(portraitPath)) {
        fs.mkdirSync(portraitPath, { recursive: true });
      }
      if (!fs.existsSync(landscapePath)) {
        fs.mkdirSync(landscapePath, { recursive: true });
      }

      // Portrait splash (width x height)
      await sharp(logoPath)
        .resize(dimensions.w, dimensions.h, {
          fit: "contain",
          background: { r: 249, g: 250, b: 254, alpha: 1 }, // #F9FAFE
        })
        .png()
        .toFile(path.join(portraitPath, "splash.png"));

      // Landscape splash (height x width - swapped)
      await sharp(logoPath)
        .resize(dimensions.h, dimensions.w, {
          fit: "contain",
          background: { r: 249, g: 250, b: 254, alpha: 1 }, // #F9FAFE
        })
        .png()
        .toFile(path.join(landscapePath, "splash.png"));

      console.log(
        `✓ Generated splash for ${portraitFolder} and ${landscapeFolder}`
      );
    }

    // Also update the default drawable splash
    const defaultSplashPath = path.join(
      androidResPath,
      "drawable",
      "splash.png"
    );
    await sharp(logoPath)
      .resize(480, 320, {
        fit: "contain",
        background: { r: 249, g: 250, b: 254, alpha: 1 },
      })
      .png()
      .toFile(defaultSplashPath);

    console.log(`✓ Generated default splash screen`);

    console.log("\nGenerating iOS app icon...");

    // iOS app icon (1024x1024)
    const iosAppIconPath = path.join(
      __dirname,
      "ios",
      "App",
      "App",
      "Assets.xcassets",
      "AppIcon.appiconset"
    );

    if (!fs.existsSync(iosAppIconPath)) {
      fs.mkdirSync(iosAppIconPath, { recursive: true });
    }

    // Generate iOS app icon (1024x1024)
    await sharp(logoPath)
      .resize(1024, 1024, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toFile(path.join(iosAppIconPath, "AppIcon-512@2x.png"));

    console.log(`✓ Generated iOS app icon`);

    console.log("\nGenerating iOS splash screen images...");

    // iOS splash screen sizes (2732x2732 for all scales)
    const iosSplashPath = path.join(
      __dirname,
      "ios",
      "App",
      "App",
      "Assets.xcassets",
      "Splash.imageset"
    );

    if (!fs.existsSync(iosSplashPath)) {
      fs.mkdirSync(iosSplashPath, { recursive: true });
    }

    // Generate iOS splash screens (2732x2732 for all scales)
    // 1x, 2x, 3x all use the same size but different filenames
    const iosSplashSize = 2732;

    // Generate 1x splash
    await sharp(logoPath)
      .resize(iosSplashSize, iosSplashSize, {
        fit: "contain",
        background: { r: 249, g: 250, b: 254, alpha: 1 }, // #F9FAFE
      })
      .png()
      .toFile(path.join(iosSplashPath, "splash-2732x2732-2.png"));

    // Generate 2x splash
    await sharp(logoPath)
      .resize(iosSplashSize, iosSplashSize, {
        fit: "contain",
        background: { r: 249, g: 250, b: 254, alpha: 1 }, // #F9FAFE
      })
      .png()
      .toFile(path.join(iosSplashPath, "splash-2732x2732-1.png"));

    // Generate 3x splash
    await sharp(logoPath)
      .resize(iosSplashSize, iosSplashSize, {
        fit: "contain",
        background: { r: 249, g: 250, b: 254, alpha: 1 }, // #F9FAFE
      })
      .png()
      .toFile(path.join(iosSplashPath, "splash-2732x2732.png"));

    console.log(`✓ Generated iOS splash screen images`);

    console.log(
      "\n✅ All icons and splash screens generated successfully from lovewaylogistic.png!"
    );
    console.log("Next steps:");
    console.log("1. Rebuild the app: npm run build && npx cap sync android && npx cap sync ios");
    console.log("2. Run in Android Studio or Xcode to see your custom icons");
  } catch (error) {
    console.error("Error generating icons:", error);
    process.exit(1);
  }
}

generateIcons();
