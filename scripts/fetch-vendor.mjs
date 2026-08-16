// 一次性下载前端依赖到本地（KaTeX、marked、STIX Two Text 字体），
// 使站点不依赖 CDN，离线/国内访问都稳定。
// 运行：node scripts/fetch-vendor.mjs
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KATEX = 'https://cdn.jsdelivr.net/npm/katex@0.16/dist/';
const KATEX_FONTS = [
  'KaTeX_AMS-Regular', 'KaTeX_Caligraphic-Bold', 'KaTeX_Caligraphic-Regular',
  'KaTeX_Fraktur-Bold', 'KaTeX_Fraktur-Regular', 'KaTeX_Main-Bold',
  'KaTeX_Main-BoldItalic', 'KaTeX_Main-Italic', 'KaTeX_Main-Regular',
  'KaTeX_Math-BoldItalic', 'KaTeX_Math-Italic',
  'KaTeX_SansSerif-Bold', 'KaTeX_SansSerif-Italic', 'KaTeX_SansSerif-Regular',
  'KaTeX_Script-Regular', 'KaTeX_Size1-Regular', 'KaTeX_Size2-Regular',
  'KaTeX_Size3-Regular', 'KaTeX_Size4-Regular', 'KaTeX_Typewriter-Regular',
].map((n) => `fonts/${n}.woff2`);

const FILES = [
  { url: KATEX + 'katex.min.css', out: 'assets/vendor/katex/katex.min.css' },
  { url: KATEX + 'katex.min.js', out: 'assets/vendor/katex/katex.min.js' },
  ...KATEX_FONTS.map((f) => ({ url: KATEX + f, out: 'assets/vendor/katex/' + f })),
  { url: 'https://cdn.jsdelivr.net/npm/marked@15/lib/marked.umd.js', out: 'assets/js/marked.umd.js' },
  { url: 'https://cdn.jsdelivr.net/npm/@fontsource/stix-two-text@5/files/stix-two-text-latin-400-normal.woff2', out: 'assets/fonts/stix-two-text-latin-400-normal.woff2' },
  { url: 'https://cdn.jsdelivr.net/npm/@fontsource/stix-two-text@5/files/stix-two-text-latin-400-italic.woff2', out: 'assets/fonts/stix-two-text-latin-400-italic.woff2' },
  { url: 'https://cdn.jsdelivr.net/npm/@fontsource/stix-two-text@5/files/stix-two-text-latin-500-normal.woff2', out: 'assets/fonts/stix-two-text-latin-500-normal.woff2' },
  { url: 'https://cdn.jsdelivr.net/npm/@fontsource/stix-two-text@5/files/stix-two-text-latin-600-normal.woff2', out: 'assets/fonts/stix-two-text-latin-600-normal.woff2' },
  { url: 'https://cdn.jsdelivr.net/npm/@fontsource/stix-two-text@5/files/stix-two-text-latin-700-normal.woff2', out: 'assets/fonts/stix-two-text-latin-700-normal.woff2' },
];

let ok = 0, fail = 0;
for (const f of FILES) {
  const dest = path.join(root, f.out);
  try {
    await access(dest);
    console.log('skip  ', f.out);
    ok++;
    continue;
  } catch {}
  try {
    const res = await fetch(f.url, { redirect: 'follow' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    console.log('ok    ', f.out, '(' + buf.length + ' B)');
    ok++;
  } catch (e) {
    console.error('FAIL  ', f.out, '-', e.message);
    fail++;
  }
}
console.log(`\n${ok} ok, ${fail} failed`);
if (fail > 0) process.exitCode = 1;
