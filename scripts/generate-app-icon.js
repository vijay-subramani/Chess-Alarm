#!/usr/bin/env node
/**
 * Renders assets/app-icon.svg into iOS AppIcon.appiconset and Android mipmap PNGs.
 * Android adaptive icons use a padded foreground layer (108dp canvas) + solid background.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'assets', 'app-icon.svg');
const androidForegroundSvg = path.join(root, 'assets', 'app-icon-android-foreground.svg');
const resvgCli = path.join(
  root,
  'node_modules',
  '@resvg',
  'resvg-js-cli',
  'bin',
  'resvg-js-cli.mjs',
);

function render(size, inputSvg, outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  execFileSync(process.execPath, [resvgCli, '--fit-width', String(size), inputSvg, outPath], {
    stdio: 'pipe',
  });
}

const iosDir = path.join(root, 'ios', 'ChessAlarmSimple', 'Images.xcassets', 'AppIcon.appiconset');
const iosIcons = [
  { size: 40, filename: 'Icon-App-20x20@2x.png', idiom: 'iphone', scale: '2x', logical: '20x20' },
  { size: 60, filename: 'Icon-App-20x20@3x.png', idiom: 'iphone', scale: '3x', logical: '20x20' },
  { size: 58, filename: 'Icon-App-29x29@2x.png', idiom: 'iphone', scale: '2x', logical: '29x29' },
  { size: 87, filename: 'Icon-App-29x29@3x.png', idiom: 'iphone', scale: '3x', logical: '29x29' },
  { size: 80, filename: 'Icon-App-40x40@2x.png', idiom: 'iphone', scale: '2x', logical: '40x40' },
  { size: 120, filename: 'Icon-App-40x40@3x.png', idiom: 'iphone', scale: '3x', logical: '40x40' },
  { size: 120, filename: 'Icon-App-60x60@2x.png', idiom: 'iphone', scale: '2x', logical: '60x60' },
  { size: 180, filename: 'Icon-App-60x60@3x.png', idiom: 'iphone', scale: '3x', logical: '60x60' },
  { size: 1024, filename: 'Icon-App-1024x1024@1x.png', idiom: 'ios-marketing', scale: '1x', logical: '1024x1024' },
];

for (const icon of iosIcons) {
  render(icon.size, svgPath, path.join(iosDir, icon.filename));
}

const contents = {
  images: iosIcons.map(icon => ({
    filename: icon.filename,
    idiom: icon.idiom,
    scale: icon.scale,
    size: icon.logical,
  })),
  info: { author: 'xcode', version: 1 },
};
fs.writeFileSync(path.join(iosDir, 'Contents.json'), `${JSON.stringify(contents, null, 2)}\n`);

/** Legacy launcher icons (pre-API 26 and fallback). */
const androidLegacySizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

/** Adaptive icon foreground layers — 108dp base with safe-zone padding. */
const androidForegroundSizes = [
  { folder: 'mipmap-mdpi', size: 108 },
  { folder: 'mipmap-hdpi', size: 162 },
  { folder: 'mipmap-xhdpi', size: 216 },
  { folder: 'mipmap-xxhdpi', size: 324 },
  { folder: 'mipmap-xxxhdpi', size: 432 },
];

for (const { folder, size } of androidLegacySizes) {
  const dir = path.join(root, 'android', 'app', 'src', 'main', 'res', folder);
  render(size, svgPath, path.join(dir, 'ic_launcher.png'));
  render(size, svgPath, path.join(dir, 'ic_launcher_round.png'));
}

for (const { folder, size } of androidForegroundSizes) {
  const dir = path.join(root, 'android', 'app', 'src', 'main', 'res', folder);
  render(size, androidForegroundSvg, path.join(dir, 'ic_launcher_foreground.png'));
}

const adaptiveDir = path.join(root, 'android', 'app', 'src', 'main', 'res', 'mipmap-anydpi-v26');
fs.mkdirSync(adaptiveDir, { recursive: true });

fs.writeFileSync(
  path.join(adaptiveDir, 'ic_launcher.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`,
);

fs.writeFileSync(
  path.join(adaptiveDir, 'ic_launcher_round.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`,
);

const valuesDir = path.join(root, 'android', 'app', 'src', 'main', 'res', 'values');
fs.mkdirSync(valuesDir, { recursive: true });
const colorsPath = path.join(valuesDir, 'colors.xml');
const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#58C040</color>
</resources>
`;
if (!fs.existsSync(colorsPath)) {
  fs.writeFileSync(colorsPath, colorsXml);
} else {
  const existing = fs.readFileSync(colorsPath, 'utf8');
  if (!existing.includes('ic_launcher_background')) {
    fs.writeFileSync(
      colorsPath,
      existing.replace('</resources>', '    <color name="ic_launcher_background">#58C040</color>\n</resources>'),
    );
  }
}

console.log('App icons generated for iOS and Android.');
