import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const androidPath = path.join(__dirname, "android");

function removeLinesContaining(content, substring) {
  const eol = content.includes("\r\n") ? "\r\n" : "\n";
  const lines = content.split(/\r?\n/);
  const filtered = lines.filter((line) => !line.includes(substring));
  return filtered.join(eol);
}

// Remove from capacitor.build.gradle
const buildGradlePath = path.join(androidPath, "app", "capacitor.build.gradle");
if (fs.existsSync(buildGradlePath)) {
  let content = fs.readFileSync(buildGradlePath, "utf8");
  // Remove any line that references the push-notifications plugin.
  // Use line-based filtering to avoid CRLF edge cases that can break Gradle syntax.
  content = removeLinesContaining(content, "capacitor-push-notifications");
  fs.writeFileSync(buildGradlePath, content);
  console.log("✓ Removed push-notifications from capacitor.build.gradle");
}

// Remove from capacitor.settings.gradle
const settingsGradlePath = path.join(androidPath, "capacitor.settings.gradle");
if (fs.existsSync(settingsGradlePath)) {
  let content = fs.readFileSync(settingsGradlePath, "utf8");
  // Remove any line that references the push-notifications plugin.
  content = removeLinesContaining(content, "capacitor-push-notifications");
  fs.writeFileSync(settingsGradlePath, content);
  console.log("✓ Removed push-notifications from capacitor.settings.gradle");
}

console.log("Push notifications plugin removed from Android build");

// Also remove from capacitor.plugins.json so Capacitor doesn't try to load the class at runtime.
const pluginsJsonPath = path.join(
  androidPath,
  "app",
  "src",
  "main",
  "assets",
  "capacitor.plugins.json"
);
if (fs.existsSync(pluginsJsonPath)) {
  try {
    const raw = fs.readFileSync(pluginsJsonPath, "utf8");
    const plugins = JSON.parse(raw);
    if (Array.isArray(plugins)) {
      const filtered = plugins.filter(
        (p) =>
          p?.pkg !== "@capacitor/push-notifications" &&
          p?.classpath !==
            "com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin"
      );
      fs.writeFileSync(pluginsJsonPath, JSON.stringify(filtered, null, "\t") + "\n");
      console.log("✓ Removed push-notifications from capacitor.plugins.json");
    }
  } catch (e) {
    console.warn("! Could not update capacitor.plugins.json:", e?.message || e);
  }
}

// Ensure capacitor.js exists in the web assets (Android expects https://localhost/capacitor.js).
// Capacitor provides the bridge as native-bridge.js inside @capacitor/android.
try {
  const sourceBridgePath = path.join(
    __dirname,
    "node_modules",
    "@capacitor",
    "android",
    "capacitor",
    "src",
    "main",
    "assets",
    "native-bridge.js"
  );
  const destPublicDir = path.join(androidPath, "app", "src", "main", "assets", "public");
  const destCapacitorJsPath = path.join(destPublicDir, "capacitor.js");

  if (fs.existsSync(sourceBridgePath)) {
    fs.mkdirSync(destPublicDir, { recursive: true });
    fs.copyFileSync(sourceBridgePath, destCapacitorJsPath);
    console.log("✓ Ensured capacitor.js exists in Android web assets");
  } else {
    console.warn("! Could not find Capacitor native bridge at:", sourceBridgePath);
  }
} catch (e) {
  console.warn("! Could not ensure capacitor.js:", e?.message || e);
}

// Native app should not use the PWA service worker (it can cache stale bundles).
try {
  const publicDir = path.join(androidPath, "app", "src", "main", "assets", "public");
  const candidates = ["sw.js", "registerSW.js"];

  for (const filename of candidates) {
    const p = path.join(publicDir, filename);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log(`✓ Removed ${filename} from Android web assets`);
    }
  }

  if (fs.existsSync(publicDir)) {
    const entries = fs.readdirSync(publicDir);
    for (const name of entries) {
      if (name.startsWith("workbox-") && name.endsWith(".js")) {
        fs.unlinkSync(path.join(publicDir, name));
        console.log(`✓ Removed ${name} from Android web assets`);
      }
    }
  }
} catch (e) {
  console.warn("! Could not remove PWA service worker assets:", e?.message || e);
}





