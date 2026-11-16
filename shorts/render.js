// usage: node render.js <episode_dir> [--stills t1,t2,...]
// Renders film.html frame-by-frame in headless Chromium and pipes frames to ffmpeg.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
(async () => {
  const ep = path.resolve(process.argv[2]), FPS = 30;
  const T = JSON.parse(fs.readFileSync(path.join(ep, 'timings.json')));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exit(1); });
  await p.goto('file://' + path.join(ep, 'film.html'));
  await p.evaluate(t => window.init(t), T);
  const si = process.argv.indexOf('--stills');
  if (si > 0) {
    for (const t of process.argv[si + 1].split(',').map(Number)) {
      await p.evaluate(t => window.render(t), t);
      await p.screenshot({ path: path.join(ep, `still_${t}.jpg`), type: 'jpeg', quality: 80 });
    }
    await b.close(); return;
  }
  const out = path.join(ep, 'final.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-r', FPS, '-i', '-',
    '-i', path.join(ep, 'mix.wav'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(T.total * FPS);
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.render(t), i / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await b.close();
  console.log('done', out, n, 'frames');
})();
