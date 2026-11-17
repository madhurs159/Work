// Cut vertical Shorts/Reels from final.mp4: node long1/cut_shorts.js  (run from shorts/)
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const path = require('path');
const D = __dirname, OUT = path.join(D, 'shorts');
const CUTS = [ // [start, end, hook line]
  [58.7, 110.0, 'कंडक्टर ने टिकट क्यों नहीं माँगा?'],
  [109.8, 150.0, 'माँ को उसकी आवाज़ क्यों नहीं आई?'],
  [149.8, 196.6, 'शीशे में उसकी सीट ख़ाली थी'],
  [196.7, 229.9, 'तीन साल बाद… वो घर लौटा'],
];
const html = (i, hook) => `<html><head><style>
@font-face{font-family:Mukta;font-weight:800;src:url(file://${D}/../node_modules/@fontsource/mukta/files/mukta-devanagari-800-normal.woff2)}
@font-face{font-family:Mukta;font-weight:800;src:url(file://${D}/../node_modules/@fontsource/mukta/files/mukta-latin-800-normal.woff2);unicode-range:U+0000-00FF,U+2026}
@font-face{font-family:Rozha;src:url(file://${D}/../node_modules/@fontsource/rozha-one/files/rozha-one-devanagari-400-normal.woff2)}
body{margin:0;width:1080px;height:1920px;position:relative;text-align:center;color:#fff0a0;text-shadow:0 6px 18px #000,0 0 4px #000}
.t{position:absolute;top:150px;width:100%;font:104px Rozha}
.p{position:absolute;top:300px;width:100%;font:800 40px Mukta;color:#8ff4ff;letter-spacing:2px}
.h{position:absolute;top:1500px;left:60px;right:60px;font:800 62px Mukta;line-height:1.25;color:#fff}
.c{position:absolute;top:1720px;width:100%;font:800 42px Mukta;color:#8ff4ff}
</style></head><body><div class=t>आख़िरी बस</div><div class=p>भाग ${i + 1} / ${CUTS.length}</div>
<div class=h>${hook}</div><div class=c>पूरी कहानी चैनल पर ▶</div></body></html>`;
(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (let i = 0; i < CUTS.length; i++) {
    const [s, e, hook] = CUTS[i], png = path.join(OUT, `ov${i + 1}.png`), d = e - s;
    await pg.setContent(html(i, hook)); await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: png, omitBackground: true });
    const fc = `[0:v]split[a][b];[a]scale=-2:1920,crop=1080:1920,gblur=sigma=40,eq=brightness=-0.25[bg];` +
      `[b]crop=1216:1080,scale=1080:960[fg];[bg][fg]overlay=0:480[v0];[v0][1:v]overlay=0:0,` +
      `fade=t=in:d=0.3,fade=t=out:st=${(d - 0.4).toFixed(2)}:d=0.4[v]`;
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(s), '-t', String(d), '-i', path.join(D, 'final.mp4'), '-i', png,
      '-filter_complex', fc, '-map', '[v]', '-map', '0:a', '-af', `afade=t=in:d=0.3,afade=t=out:st=${(d - 0.5).toFixed(2)}:d=0.5`,
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-level', '4.0', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k',
      '-movflags', '+faststart', path.join(OUT, `short${i + 1}.mp4`)], { stdio: 'inherit' });
    require('fs').unlinkSync(png); console.log('short', i + 1, d.toFixed(1) + 's');
  }
  await b.close();
})();
