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

// Use different images for app icon and splash screen
const appIconPath = path.join(__dirname, "public", "lovewaylogistic.png"); // App icon
const splashLogoPath = path.join(__dirname, "public", "logo-text.png"); // Splash screen
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
    // Check if logos exist
    if (!fs.existsSync(appIconPath)) {
      console.error(`App icon not found at: ${appIconPath}`);
      process.exit(1);
    }
    if (!fs.existsSync(splashLogoPath)) {
      console.error(`Splash logo not found at: ${splashLogoPath}`);
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
      // Use fit: "inside" to ensure image fits without cropping, with padding
      const iconSize = Math.floor(size * 0.9);
      const iconPadding = Math.floor((size - iconSize) / 2);
      
      await sharp(appIconPath)
        .resize(iconSize, iconSize, {
          fit: "inside",
          withoutEnlargement: true,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .extend({
          top: iconPadding,
          bottom: iconPadding,
          left: iconPadding,
          right: iconPadding,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(path.join(folderPath, "ic_launcher_foreground.png"));

      // Generate full icon (logo on white background for better visibility)
      await sharp(appIconPath)
        .resize(iconSize, iconSize, {
          fit: "inside",
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .extend({
          top: iconPadding,
          bottom: iconPadding,
          left: iconPadding,
          right: iconPadding,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png()
        .toFile(path.join(folderPath, "ic_launcher.png"));

      // Generate round icon
      await sharp(appIconPath)
        .resize(iconSize, iconSize, {
          fit: "inside",
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .extend({
          top: iconPadding,
          bottom: iconPadding,
          left: iconPadding,
          right: iconPadding,
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

      // Portrait splash (width x height) - fit without zooming
      // Use logo-text.png for splash screens
      const portraitLogoW = Math.floor(dimensions.w * 0.8);
      const portraitLogoH = Math.floor(dimensions.h * 0.8);
      const portraitPaddingW = Math.floor((dimensions.w - portraitLogoW) / 2);
      const portraitPaddingH = Math.floor((dimensions.h - portraitLogoH) / 2);
      
      await sharp(splashLogoPath)
        .resize(portraitLogoW, portraitLogoH, {
          fit: "inside",
          withoutEnlargement: true,
          background: { r: 249, g: 250, b: 254, alpha: 1 }, // #F9FAFE
        })
        .extend({
          top: portraitPaddingH,
          bottom: portraitPaddingH,
          left: portraitPaddingW,
          right: portraitPaddingW,
          background: { r: 249, g: 250, b: 254, alpha: 1 },
        })
        .png()
        .toFile(path.join(portraitPath, "splash.png"));

      // Landscape splash (height x width - swapped) - fit without zooming
      const landscapeLogoW = Math.floor(dimensions.h * 0.8);
      const landscapeLogoH = Math.floor(dimensions.w * 0.8);
      const landscapePaddingW = Math.floor((dimensions.h - landscapeLogoW) / 2);
      const landscapePaddingH = Math.floor((dimensions.w - landscapeLogoH) / 2);
      
      await sharp(splashLogoPath)
        .resize(landscapeLogoW, landscapeLogoH, {
          fit: "inside",
          withoutEnlargement: true,
          background: { r: 249, g: 250, b: 254, alpha: 1 }, // #F9FAFE
        })
        .extend({
          top: landscapePaddingH,
          bottom: landscapePaddingH,
          left: landscapePaddingW,
          right: landscapePaddingW,
          background: { r: 249, g: 250, b: 254, alpha: 1 },
        })
        .png()
        .toFile(path.join(landscapePath, "splash.png"));

      console.log(
        `✓ Generated splash for ${portraitFolder} and ${landscapeFolder}`
      );
    }

    // Also update the default drawable splash - fit without zooming
    // Use logo-text.png for splash screens
    const defaultSplashPath = path.join(
      androidResPath,
      "drawable",
      "splash.png"
    );
    const defaultLogoW = Math.floor(480 * 0.8);
    const defaultLogoH = Math.floor(320 * 0.8);
    const defaultPaddingW = Math.floor((480 - defaultLogoW) / 2);
    const defaultPaddingH = Math.floor((320 - defaultLogoH) / 2);
    
    await sharp(splashLogoPath)
      .resize(defaultLogoW, defaultLogoH, {
        fit: "inside",
        withoutEnlargement: true,
        background: { r: 249, g: 250, b: 254, alpha: 1 },
      })
      .extend({
        top: defaultPaddingH,
        bottom: defaultPaddingH,
        left: defaultPaddingW,
        right: defaultPaddingW,
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

    // Generate iOS app icon (1024x1024) - fit without zooming, with padding
    // Use lovewaylogistic.png for app icon
    // iOS requires exactly 1024x1024 pixels
    const targetSize = 1024;
    const logoSize = Math.floor(targetSize * 0.9); // Logo takes 90% of space
    
    // First, get the image metadata to calculate proper sizing
    const metadata = await sharp(appIconPath).metadata();
    const logoAspectRatio = metadata.width / metadata.height;
    
    let logoWidth, logoHeight;
    if (logoAspectRatio > 1) {
      // Landscape: fit width
      logoWidth = logoSize;
      logoHeight = Math.floor(logoSize / logoAspectRatio);
    } else {
      // Portrait or square: fit height
      logoHeight = logoSize;
      logoWidth = Math.floor(logoSize * logoAspectRatio);
    }
    
    // Calculate padding to center the logo
    const paddingTop = Math.floor((targetSize - logoHeight) / 2);
    const paddingBottom = targetSize - logoHeight - paddingTop;
    const paddingLeft = Math.floor((targetSize - logoWidth) / 2);
    const paddingRight = targetSize - logoWidth - paddingLeft;
    
    // Create a 1024x1024 white background and composite the resized logo on top
    const resizedLogo = await sharp(appIconPath)
      .resize(logoWidth, logoHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();
    
    await sharp({
      create: {
        width: targetSize,
        height: targetSize,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([
        {
          input: resizedLogo,
          left: paddingLeft,
          top: paddingTop,
        },
      ])
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

    // Generate iOS splash screens - fit without zooming, with padding
    // Use logo-text.png for splash screens
    const splashLogoSize = Math.floor(iosSplashSize * 0.7); // Use 70% of screen to ensure visibility
    const splashPadding = Math.floor((iosSplashSize - splashLogoSize) / 2);

    // Generate 1x splash
    await sharp(splashLogoPath)
      .resize(splashLogoSize, splashLogoSize, {
        fit: "inside",
        withoutEnlargement: true,
        background: { r: 249, g: 250, b: 254, alpha: 1 }, // #F9FAFE
      })
      .extend({
        top: splashPadding,
        bottom: splashPadding,
        left: splashPadding,
        right: splashPadding,
        background: { r: 249, g: 250, b: 254, alpha: 1 },
      })
      .png()
      .toFile(path.join(iosSplashPath, "splash-2732x2732-2.png"));

    // Generate 2x splash
    await sharp(splashLogoPath)
      .resize(splashLogoSize, splashLogoSize, {
        fit: "inside",
        withoutEnlargement: true,
        background: { r: 249, g: 250, b: 254, alpha: 1 }, // #F9FAFE
      })
      .extend({
        top: splashPadding,
        bottom: splashPadding,
        left: splashPadding,
        right: splashPadding,
        background: { r: 249, g: 250, b: 254, alpha: 1 },
      })
      .png()
      .toFile(path.join(iosSplashPath, "splash-2732x2732-1.png"));

    // Generate 3x splash
    await sharp(splashLogoPath)
      .resize(splashLogoSize, splashLogoSize, {
        fit: "inside",
        withoutEnlargement: true,
        background: { r: 249, g: 250, b: 254, alpha: 1 }, // #F9FAFE
      })
      .extend({
        top: splashPadding,
        bottom: splashPadding,
        left: splashPadding,
        right: splashPadding,
        background: { r: 249, g: 250, b: 254, alpha: 1 },
      })
      .png()
      .toFile(path.join(iosSplashPath, "splash-2732x2732.png"));

    console.log(`✓ Generated iOS splash screen images`);

    console.log(
      "\n✅ All icons and splash screens generated successfully!"
    );
    console.log("   - App icons: lovewaylogistic.png");
    console.log("   - Splash screens: logo-text.png");
    console.log("Next steps:");
    console.log("1. Rebuild the app: npm run build && npx cap sync android && npx cap sync ios");
    console.log("2. Run in Android Studio or Xcode to see your custom icons");
  } catch (error) {
    console.error("Error generating icons:", error);
    process.exit(1);
  }
}

generateIcons();
