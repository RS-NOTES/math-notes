// 扫描 content/ 生成 data/manifest.json 与 data/site.json
// 运行：node scripts/build.mjs
import { readFile, writeFile, readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(await readFile(path.join(root, 'config.json'), 'utf8'));

/* ---------- PDF 分类规则（按顺序匹配，命中即止） ---------- */
const PDF_RULES = [
  ['代数几何', ['riemann', 'sheaf']],
  ['复分析', ['holomorphic', 'cousin', '解析函数芽', 'o_u', 'geometry_of_c', 'c^n', 'c__n']],
  ['交换代数与数论', ['nakayama', 'chain_condition', 'going_up', 'integral_dependence', 'noetherian', 'artinian', '理想', '局部化', 'euler', 'fermat']],
  ['泛函分析', ['算子', 'closable', '共轭', '投影']],
  ['代数与同调', ['exact_sequence', 'tensor_product', 'exterior', '函子', '范畴']],
  ['基础与分析', ['不等式', '多元微积分', '选修课', '样板']],
];
const FALLBACK_CAT = '微分几何';

/* ---------- 标题清理 ---------- */
const SMALL = new Set(['of', 'a', 'an', 'the', 'in', 'on', 'and', 'for', 'to', 'at', 'with']);
function titleCase(s) {
  const words = s.split(' ');
  return words
    .map((w, i) => {
      if (i > 0 && SMALL.has(w.toLowerCase())) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}
function cleanTitle(name) {
  let t = name.replace(/\.pdf$/i, '');
  t = t.replace(/_remake_?/gi, '（重制版）');
  t = t.replace(/__Copy_?\s*(\(\d+\))?$/i, '');
  t = t.replace(/\s*\(\s*(\d+)\s*\)\s*$/u, '（$1）');
  t = t.replace(/_\(?(\d+)\)?_?$/u, '（$1）');
  t = t.replace(/ +（/g, '（');
  t = t.replace(/C__n_?/g, 'Cⁿ');
  t = t.replace(/O_U/g, '𝒪_U');
  t = t.replace(/_+/g, ' ');
  t = t.replace(/\s+/g, ' ').trim();
  t = t.replace(/𝒪 U/g, '𝒪_U');
  if (/^[\x00-\x7F\s]+$/.test(t)) t = titleCase(t.toLowerCase());
  return t;
}

/* ---------- 工具 ---------- */
async function walk(dir, pred) {
  const out = [];
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p, pred)));
    else if (pred(e.name)) out.push(p);
  }
  return out;
}
function toPosix(p) { return p.split(path.sep).join('/'); }
function parseFront(md) {
  const meta = {};
  if (md.startsWith('---')) {
    const end = md.indexOf('\n---', 4);
    if (end !== -1) {
      for (const line of md.slice(4, end).split('\n')) {
        const i = line.indexOf(':');
        if (i <= 0) continue;
        const k = line.slice(0, i).trim();
        let v = line.slice(i + 1).trim();
        if (v.startsWith('[') && v.endsWith(']')) {
          v = v.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
        } else {
          v = v.replace(/^["']|["']$/g, '');
        }
        meta[k] = v;
      }
    }
  }
  return meta;
}
function humanSize(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/* ---------- 笔记 ---------- */
const notes = [];
for (const p of await walk(path.join(root, 'content', 'notes'), (n) => n.endsWith('.md'))) {
  const rel = toPosix(path.relative(root, p));
  const md = await readFile(p, 'utf8');
  const fm = parseFront(md);
  const title = fm.title || cleanTitle(path.basename(p, '.md'));
  notes.push({
    slug: path.basename(p, '.md'),
    path: rel,
    title: typeof title === 'string' ? title : String(title),
    date: fm.date ? String(fm.date) : null,
    category: fm.category ? String(fm.category) : '未分类',
    tags: Array.isArray(fm.tags) ? fm.tags.map(String) : (fm.tags ? [String(fm.tags)] : []),
    summary: fm.summary ? String(fm.summary) : '',
  });
}
notes.sort((a, b) => {
  if (a.date && b.date) return a.date < b.date ? 1 : -1;
  if (a.date) return -1;
  if (b.date) return 1;
  return 0;
});

/* ---------- 文献（PDF） ---------- */
let metaOver = {};
try {
  metaOver = JSON.parse(await readFile(path.join(root, 'content', 'pdfs', 'meta.json'), 'utf8'));
} catch {}
const collator = new Intl.Collator('zh-Hans-CN', { sensitivity: 'base' });
const catOrder = cfg.categories || [];
const pdfs = [];
for (const p of await walk(path.join(root, 'content', 'pdfs'), (n) => n.toLowerCase().endsWith('.pdf'))) {
  const name = path.basename(p);
  const lower = name.toLowerCase();
  let category = FALLBACK_CAT;
  for (const [cat, kws] of PDF_RULES) {
    if (kws.some((k) => lower.includes(k))) { category = cat; break; }
  }
  const over = metaOver[name] || {};
  const st = await stat(p);
  pdfs.push({
    slug: path.basename(p, '.pdf'),
    path: toPosix(path.relative(root, p)),
    title: over.title || cleanTitle(name),
    category: over.category || category,
    tags: Array.isArray(over.tags) ? over.tags.map(String) : (over.tags ? [String(over.tags)] : []),
    size: humanSize(st.size),
    date: null,
  });
}
pdfs.sort((a, b) => {
  const ca = catOrder.indexOf(a.category);
  const cb = catOrder.indexOf(b.category);
  const ia = ca === -1 ? 999 : ca;
  const ib = cb === -1 ? 999 : cb;
  if (ia !== ib) return ia - ib;
  return collator.compare(a.title, b.title);
});

/* ---------- 输出 ---------- */
await mkdir(path.join(root, 'data'), { recursive: true });
const manifest = {
  generated: new Date().toISOString(),
  notes,
  pdfs,
};
await writeFile(path.join(root, 'data', 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
const site = {
  ...cfg,
  builtAt: new Date().toISOString(),
  noteCount: notes.length,
  pdfCount: pdfs.length,
};
await writeFile(path.join(root, 'data', 'site.json'), JSON.stringify(site, null, 2) + '\n');
console.log(`构建完成：${notes.length} 篇笔记，${pdfs.length} 篇文献`);
for (const [cat, list] of Object.entries(groupBy(pdfs, 'category'))) {
  console.log(`  ${cat}: ${list.length}`);
}

function groupBy(arr, key) {
  const out = {};
  for (const it of arr) (out[it[key]] = out[it[key]] || []).push(it);
  return out;
}
