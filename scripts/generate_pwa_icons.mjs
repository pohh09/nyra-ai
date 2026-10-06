import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateAllPwaAssets() {
  const iconsDir = 'public/icons';
  const splashDir = 'public/splash';

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  if (!fs.existsSync(splashDir)) {
    fs.mkdirSync(splashDir, { recursive: true });
  }

  const logoPath = 'public/logo.png';
  if (!fs.existsSync(logoPath)) {
    throw new Error(`Logo file not found at ${logoPath}`);
  }

  const logoBuffer = fs.readFileSync(logoPath);
  const BG_COLOR = '#07090E';

  console.log('--- Generating Nyra AI Mobile App Covers & Icons from existing Logo ---');

  async function createFeatheredLogo(size) {
    const maskSvg = Buffer.from(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="featherMask" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stop-color="#ffffff" stop-opacity="1"/>
            <stop offset="85%" stop-color="#ffffff" stop-opacity="0.5"/>
            <stop offset="98%" stop-color="#ffffff" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#featherMask)"/>
      </svg>
    `);

    const maskBuffer = await sharp(maskSvg).png().toBuffer();

    return await sharp(logoBuffer)
      .resize(size, size, { fit: 'contain' })
      .ensureAlpha()
      .composite([{ input: maskBuffer, blend: 'dest-in' }])
      .png()
      .toBuffer();
  }

  await sharp(logoBuffer)
    .resize(512, 512, { fit: 'cover' })
    .png({ quality: 100 })
    .toFile('public/icons/icon-512x512.png');
  console.log('✓ Created public/icons/icon-512x512.png');

  await sharp(logoBuffer)
    .resize(192, 192, { fit: 'cover' })
    .png({ quality: 100 })
    .toFile('public/icons/icon-192x192.png');
  console.log('✓ Created public/icons/icon-192x192.png');

  await sharp(logoBuffer)
    .resize(512, 512, { fit: 'cover' })
    .png({ quality: 100 })
    .toFile('public/icon.png');
  console.log('✓ Updated public/icon.png');

  await sharp(logoBuffer)
    .resize(512, 512, { fit: 'cover' })
    .png({ quality: 100 })
    .toFile('app/icon.png');
  console.log('✓ Updated app/icon.png');

  const maskableBgSvg = Buffer.from(`
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#141724" stop-opacity="1"/>
          <stop offset="60%" stop-color="#0a0d16" stop-opacity="1"/>
          <stop offset="100%" stop-color="#06070B" stop-opacity="1"/>
        </radialGradient>
      </defs>
      <rect width="512" height="512" fill="url(#bgGlow)"/>
    </svg>
  `);

  const featheredLogo410 = await createFeatheredLogo(410);

  await sharp(maskableBgSvg)
    .composite([
      {
        input: featheredLogo410,
        top: 51,
        left: 51,
      },
    ])
    .png({ quality: 100 })
    .toFile('public/icons/icon-maskable-512x512.png');
  console.log('✓ Created seamless public/icons/icon-maskable-512x512.png');

  await sharp('public/icons/icon-maskable-512x512.png')
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile('public/icons/icon-maskable-192x192.png');
  console.log('✓ Created seamless public/icons/icon-maskable-192x192.png');

  await sharp(logoBuffer)
    .resize(180, 180, { fit: 'cover' })
    .png({ quality: 100 })
    .toFile('public/apple-touch-icon.png');
  console.log('✓ Created public/apple-touch-icon.png');

  await sharp(logoBuffer)
    .resize(64, 64, { fit: 'cover' })
    .png({ quality: 100 })
    .toFile('public/favicon.png');
  console.log('✓ Updated public/favicon.png');

  const splashWidth = 1170;
  const splashHeight = 2532;
  const logoSplashSize = 750;

  const splashBgSvg = Buffer.from(`
    <svg width="${splashWidth}" height="${splashHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="splashCenterGlow" cx="50%" cy="48%" r="40%">
          <stop offset="0%" stop-color="#191c2b" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#0c0e18" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#05070B" stop-opacity="1"/>
        </radialGradient>
      </defs>
      <rect width="${splashWidth}" height="${splashHeight}" fill="#05070B"/>
      <rect width="${splashWidth}" height="${splashHeight}" fill="url(#splashCenterGlow)"/>
    </svg>
  `);

  const featheredLogoSplash = await createFeatheredLogo(logoSplashSize);
  const splashTop = Math.round((splashHeight - logoSplashSize) / 2) - 80;
  const splashLeft = Math.round((splashWidth - logoSplashSize) / 2);

  await sharp(splashBgSvg)
    .composite([
      {
        input: featheredLogoSplash,
        top: splashTop,
        left: splashLeft,
      },
    ])
    .png({ quality: 100 })
    .toFile('public/splash/apple-splash.png');
  console.log('✓ Created seamless public/splash/apple-splash.png (1170x2532)');

  const splashMaxW = 1290;
  const splashMaxH = 2796;
  const logoSplashMaxSize = 840;

  const splashMaxBgSvg = Buffer.from(`
    <svg width="${splashMaxW}" height="${splashMaxH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="splashMaxGlow" cx="50%" cy="48%" r="40%">
          <stop offset="0%" stop-color="#191c2b" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#0c0e18" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#05070B" stop-opacity="1"/>
        </radialGradient>
      </defs>
      <rect width="${splashMaxW}" height="${splashMaxH}" fill="#05070B"/>
      <rect width="${splashMaxW}" height="${splashMaxH}" fill="url(#splashMaxGlow)"/>
    </svg>
  `);

  const featheredLogoSplashMax = await createFeatheredLogo(logoSplashMaxSize);
  const splashMaxTop = Math.round((splashMaxH - logoSplashMaxSize) / 2) - 90;
  const splashMaxLeft = Math.round((splashMaxW - logoSplashMaxSize) / 2);

  await sharp(splashMaxBgSvg)
    .composite([
      {
        input: featheredLogoSplashMax,
        top: splashMaxTop,
        left: splashMaxLeft,
      },
    ])
    .png({ quality: 100 })
    .toFile('public/splash/apple-splash-1290x2796.png');
  console.log('✓ Created seamless public/splash/apple-splash-1290x2796.png (1290x2796)');

  const coverW = 1080;
  const coverH = 1920;
  const logoCoverSize = 720;

  const coverBgSvg = Buffer.from(`
    <svg width="${coverW}" height="${coverH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="coverGlow" cx="50%" cy="48%" r="45%">
          <stop offset="0%" stop-color="#191c2b" stop-opacity="0.85"/>
          <stop offset="55%" stop-color="#0c0e18" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="#05070B" stop-opacity="1"/>
        </radialGradient>
      </defs>
      <rect width="${coverW}" height="${coverH}" fill="#05070B"/>
      <rect width="${coverW}" height="${coverH}" fill="url(#coverGlow)"/>
    </svg>
  `);

  const featheredLogoCover = await createFeatheredLogo(logoCoverSize);
  const coverTop = Math.round((coverH - logoCoverSize) / 2) - 60;
  const coverLeft = Math.round((coverW - logoCoverSize) / 2);

  await sharp(coverBgSvg)
    .composite([
      {
        input: featheredLogoCover,
        top: coverTop,
        left: coverLeft,
      },
    ])
    .png({ quality: 100 })
    .toFile('public/splash/mobile-cover.png');
  console.log('✓ Created seamless public/splash/mobile-cover.png (1080x1920)');

  console.log('\nAll Nyra AI mobile covers and PWA icons generated successfully with pristine seamless gradients!');
}

generateAllPwaAssets().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
