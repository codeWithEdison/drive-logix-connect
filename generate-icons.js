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

      // Portrait splash (width x height) - fit without zooming, preserve aspect ratio
      // Use logo-text.png for splash screens
      // Get source image dimensions to calculate proper sizing
      const sourceMetadata = await sharp(splashLogoPath).metadata();
      const sourceAspectRatio = sourceMetadata.width / sourceMetadata.height;
      
      // Calculate max dimensions that fit within 80% of screen
      const maxLogoW = Math.floor(dimensions.w * 0.8);
      const maxLogoH = Math.floor(dimensions.h * 0.8);
      
      // Calculate actual logo dimensions maintaining aspect ratio
      let logoW, logoH;
      if (sourceAspectRatio > (maxLogoW / maxLogoH)) {
        // Image is wider - fit to width
        logoW = maxLogoW;
        logoH = Math.floor(maxLogoW / sourceAspectRatio);
      } else {
        // Image is taller - fit to height
        logoH = maxLogoH;
        logoW = Math.floor(maxLogoH * sourceAspectRatio);
      }
      
      const portraitPaddingW = Math.floor((dimensions.w - logoW) / 2);
      const portraitPaddingH = Math.floor((dimensions.h - logoH) / 2);
      
      // Resize logo maintaining aspect ratio, then composite onto background
      const resizedLogo = await sharp(splashLogoPath)
        .resize(logoW, logoH, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toBuffer();
      
      await sharp({
        create: {
          width: dimensions.w,
          height: dimensions.h,
          channels: 4,
          background: { r: 249, g: 250, b: 254, alpha: 1 }, // #F9FAFE
        },
      })
        .composite([
          {
            input: resizedLogo,
            left: portraitPaddingW,
            top: portraitPaddingH,
          },
        ])
        .png()
        .toFile(path.join(portraitPath, "splash.png"));

      // Landscape splash (height x width - swapped) - fit without zooming, preserve aspect ratio
      // Calculate max dimensions that fit within 80% of screen (swapped for landscape)
      const maxLandscapeW = Math.floor(dimensions.h * 0.8);
      const maxLandscapeH = Math.floor(dimensions.w * 0.8);
      
      // Calculate actual logo dimensions maintaining aspect ratio
      let landscapeLogoW, landscapeLogoH;
      if (sourceAspectRatio > (maxLandscapeW / maxLandscapeH)) {
        // Image is wider - fit to width
        landscapeLogoW = maxLandscapeW;
        landscapeLogoH = Math.floor(maxLandscapeW / sourceAspectRatio);
      } else {
        // Image is taller - fit to height
        landscapeLogoH = maxLandscapeH;
        landscapeLogoW = Math.floor(maxLandscapeH * sourceAspectRatio);
      }
      
      const landscapePaddingW = Math.floor((dimensions.h - landscapeLogoW) / 2);
      const landscapePaddingH = Math.floor((dimensions.w - landscapeLogoH) / 2);
      
      // Resize logo maintaining aspect ratio, then composite onto background
      const resizedLandscapeLogo = await sharp(splashLogoPath)
        .resize(landscapeLogoW, landscapeLogoH, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toBuffer();
      
      await sharp({
        create: {
          width: dimensions.h,
          height: dimensions.w,
          channels: 4,
          background: { r: 249, g: 250, b: 254, alpha: 1 }, // #F9FAFE
        },
      })
        .composite([
          {
            input: resizedLandscapeLogo,
            left: landscapePaddingW,
            top: landscapePaddingH,
          },
        ])
        .png()
        .toFile(path.join(landscapePath, "splash.png"));

      console.log(
        `✓ Generated splash for ${portraitFolder} and ${landscapeFolder}`
      );
    }

    // Also update the default drawable splash - fit without zooming, preserve aspect ratio
    // Use logo-text.png for splash screens
    const defaultSplashPath = path.join(
      androidResPath,
      "drawable",
      "splash.png"
    );
    
    // Get source image dimensions if not already available
    const defaultSourceMetadata = await sharp(splashLogoPath).metadata();
    const defaultSourceAspectRatio = defaultSourceMetadata.width / defaultSourceMetadata.height;
    
    // Calculate max dimensions that fit within 80% of screen
    const defaultMaxW = Math.floor(480 * 0.8);
    const defaultMaxH = Math.floor(320 * 0.8);
    
    // Calculate actual logo dimensions maintaining aspect ratio
    let defaultLogoW, defaultLogoH;
    if (defaultSourceAspectRatio > (defaultMaxW / defaultMaxH)) {
      // Image is wider - fit to width
      defaultLogoW = defaultMaxW;
      defaultLogoH = Math.floor(defaultMaxW / defaultSourceAspectRatio);
    } else {
      // Image is taller - fit to height
      defaultLogoH = defaultMaxH;
      defaultLogoW = Math.floor(defaultMaxH * defaultSourceAspectRatio);
    }
    
    const defaultPaddingW = Math.floor((480 - defaultLogoW) / 2);
    const defaultPaddingH = Math.floor((320 - defaultLogoH) / 2);
    
    // Resize logo maintaining aspect ratio, then composite onto background
    const resizedDefaultLogo = await sharp(splashLogoPath)
      .resize(defaultLogoW, defaultLogoH, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();
    
    await sharp({
      create: {
        width: 480,
        height: 320,
        channels: 4,
        background: { r: 249, g: 250, b: 254, alpha: 1 },
      },
    })
      .composite([
        {
          input: resizedDefaultLogo,
          left: defaultPaddingW,
          top: defaultPaddingH,
        },
      ])
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

    // Generate iOS splash screens - fit without zooming, preserve aspect ratio
    // Use logo-text.png for splash screens
    // Get source image dimensions to calculate proper sizing
    const iosSourceMetadata = await sharp(splashLogoPath).metadata();
    const iosSourceAspectRatio = iosSourceMetadata.width / iosSourceMetadata.height;
    
    // Calculate max dimensions that fit within 70% of screen (2732x2732 is square)
    const maxIosLogoSize = Math.floor(iosSplashSize * 0.7);
    
    // Calculate actual logo dimensions maintaining aspect ratio
    let iosLogoW, iosLogoH;
    if (iosSourceAspectRatio > 1) {
      // Image is wider - fit to width
      iosLogoW = maxIosLogoSize;
      iosLogoH = Math.floor(maxIosLogoSize / iosSourceAspectRatio);
    } else {
      // Image is taller or square - fit to height
      iosLogoH = maxIosLogoSize;
      iosLogoW = Math.floor(maxIosLogoSize * iosSourceAspectRatio);
    }
    
    const iosPaddingW = Math.floor((iosSplashSize - iosLogoW) / 2);
    const iosPaddingH = Math.floor((iosSplashSize - iosLogoH) / 2);
    
    // Resize logo maintaining aspect ratio, then composite onto background
    const resizedIosLogo = await sharp(splashLogoPath)
      .resize(iosLogoW, iosLogoH, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();
    
    const iosSplashBackground = await sharp({
      create: {
        width: iosSplashSize,
        height: iosSplashSize,
        channels: 4,
        background: { r: 249, g: 250, b: 254, alpha: 1 }, // #F9FAFE
      },
    })
      .composite([
        {
          input: resizedIosLogo,
          left: iosPaddingW,
          top: iosPaddingH,
        },
      ])
      .png()
      .toBuffer();

    // Generate all three splash files with the same image
    await sharp(iosSplashBackground)
      .toFile(path.join(iosSplashPath, "splash-2732x2732-2.png"));
    
    await sharp(iosSplashBackground)
      .toFile(path.join(iosSplashPath, "splash-2732x2732-1.png"));
    
    await sharp(iosSplashBackground)
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
