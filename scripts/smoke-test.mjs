// 渲染冒烟测试：验证 marked + KaTeX 管线与真实内容
// 运行：node scripts/smoke-test.mjs
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const katex = require(path.join(root, 'assets/vendor/katex/katex.min.js'));
const marked = require(path.join(root, 'assets/js/marked.umd.js'));

function protectMarkdown(md) {
  const code = [], icode = [], math = [];
  md = md.replace(/```[^\n]*\n[\s\S]*?```/g, (m) => { code.push(m); return '@@CODE' + (code.length - 1) + '@@'; });
  md = md.replace(/(?<![`\\])`([^`\n]+)`/g, (m, body) => { icode.push(body); return '@@ICODE' + (icode.length - 1) + '@@'; });
  md = md.replace(/(?<!\\)\$\$([\s\S]+?)(?<!\\)\$\$/g, (m, tex) => { math.push({ tex, display: true }); return '@@M' + (math.length - 1) + '@@'; });
  md = md.replace(/(?<!\\)\$([^$\n]+?)(?<!\\)\$/g, (m, tex) => { math.push({ tex, display: false }); return '@@M' + (math.length - 1) + '@@'; });
  md = md.replace(/\\\$/g, '$');
  return { md, code, icode, math };
}
function restoreMarkdown(html, p) {
  p.math.forEach((m, i) => {
    let out;
    try {
      out = katex.renderToString(m.tex, { displayMode: m.display, throwOnError: false, strict: 'ignore', trust: false });
    } catch { out = m.tex; }
    html = html.split('@@M' + i + '@@').join(out);
  });
  p.code.forEach((c, i) => {
    const m = c.match(/^```([^\n]*)\n([\s\S]*)```$/);
    const info = m ? m[1].trim() : '';
    const body = m ? m[2] : c;
    html = html.split('@@CODE' + i + '@@').join('<pre><code>' + body + '</code></pre>');
  });
  p.icode.forEach((c, i) => {
    html = html.split('@@ICODE' + i + '@@').join('<code>' + c + '</code>');
  });
  return html;
}
function renderMD(md) {
  const p = protectMarkdown(md);
  return restoreMarkdown(marked.parse(p.md, { gfm: true, breaks: false }), p);
}
function stripFront(md) {
  if (md.startsWith('---')) {
    const end = md.indexOf('\n---', 4);
    if (end !== -1) md = md.slice(end + 4).replace(/^\n+/, '');
  }
  return md;
}

let fail = 0;
const check = (name, cond) => {
  console.log((cond ? 'PASS' : 'FAIL') + '  ' + name);
  if (!cond) fail++;
};

const md = readFileSync(path.join(root, 'content', 'notes', 'how-to.md'), 'utf8');
const out = renderMD(stripFront(md));
check('无残留占位符', !/@@[A-Z]+\d+@@/.test(out));
const noCode = out.replace(/<code>[\s\S]*?<\/code>/g, '').replace(/<[^>]+>/g, ' ');
check('无残留 $（代码示例除外）', !noCode.includes('$'));
check('行内公式渲染 (katex span)', out.includes('class="katex"'));
check('独立公式渲染 (katex-display)', out.includes('katex-display'));
check('定理环境输出', out.includes('thm-head'));
check('证明环境输出', out.includes('proof-head'));
check('代码块输出', out.includes('<pre><code'));
check('front matter 已剥离', !out.includes('category: 指南'));

const about = readFileSync(path.join(root, 'content', 'about.md'), 'utf8');
const aboutOut = renderMD(about);
check('about.md 渲染含公式', aboutOut.includes('class="katex"'));

check('KaTeX 样例', katex.renderToString('e^{i\\pi}+1=0').includes('katex'));
check('marked 可用', typeof marked.parse === 'function');

console.log(fail ? '\nSMOKE FAILED (' + fail + ')' : '\nSMOKE OK');
process.exitCode = fail ? 1 : 0;
