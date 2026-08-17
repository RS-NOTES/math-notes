/* ============================================================
   数学笔记 · 站点脚本
   中英切换、明暗主题、Markdown+KaTeX 渲染、清单与搜索
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- 词条 ---------------- */
  const I18N = {
    zh: {
      'nav.home': '首页', 'nav.notes': '笔记', 'nav.pdfs': '文献', 'nav.about': '关于',
      'search.placeholder': '搜索标题、主题、标签…',
      'home.categories': '分类', 'home.recent': '最近笔记', 'home.papers': '文献',
      'home.papers.more': '全部 {n} 篇文献', 'home.notes.more': '全部笔记',
      'home.geo': '几何速写', 'home.geo.sub': '微分流形 · Riemann 流形 · 复流形',
      'notes.title': '笔记', 'notes.count': '共 {n} 篇', 'notes.all': '全部',
      'pdfs.title': '文献', 'pdfs.count': '共 {n} 篇', 'pdfs.all': '全部',
      'note.back': '← 返回笔记', 'note.edit': '在 GitHub 上编辑此页',
      'pdf.back': '← 返回文献', 'pdf.download': '下载 PDF', 'pdf.manage': '在 GitHub 上管理此文件',
      'about.title': '关于',
      'foot.rendered': '以 KaTeX 排版', 'foot.repo': 'GitHub',
      'search.empty': '没有找到匹配的内容。',
      'err.notfound': '未找到该页面。',
      'err.load': '加载失败：请通过本地服务器（node scripts/serve.mjs）或线上部署访问本站。',
      'cat.uncategorized': '未分类',
    },
    en: {
      'nav.home': 'Home', 'nav.notes': 'Notes', 'nav.pdfs': 'Papers', 'nav.about': 'About',
      'search.placeholder': 'Search titles, topics, tags…',
      'home.categories': 'Categories', 'home.recent': 'Recent Notes', 'home.papers': 'Papers',
      'home.papers.more': 'All {n} papers', 'home.notes.more': 'All notes',
      'home.geo': 'Geometry Sketches', 'home.geo.sub': 'Manifolds · Riemannian · Complex',
      'notes.title': 'Notes', 'notes.count': '{n} notes', 'notes.all': 'All',
      'pdfs.title': 'Papers', 'pdfs.count': '{n} papers', 'pdfs.all': 'All',
      'note.back': '← Back to Notes', 'note.edit': 'Edit on GitHub',
      'pdf.back': '← Back to Papers', 'pdf.download': 'Download PDF', 'pdf.manage': 'Manage on GitHub',
      'about.title': 'About',
      'foot.rendered': 'Typeset with KaTeX', 'foot.repo': 'GitHub',
      'search.empty': 'No matching items found.',
      'err.notfound': 'Page not found.',
      'err.load': 'Failed to load: please visit via the local server (node scripts/serve.mjs) or the deployed site.',
      'cat.uncategorized': 'Uncategorized',
    },
  };
  /* 首页著名公式装饰（轮播，LaTeX 排版 SVG 图片） */
  const FORMULAS = [
    { src: 'assets/formulas/gauss-bonnet.svg', name: { zh: 'Gauss–Bonnet定理', en: 'Gauss–Bonnet theorem' } },
    { src: 'assets/formulas/riemann-roch.svg', name: { zh: 'Riemann–Roch定理', en: 'Riemann–Roch theorem' } },
    { src: 'assets/formulas/stokes.svg', name: { zh: 'Stokes公式', en: "Stokes' theorem" } },
    { src: 'assets/formulas/euler.svg', name: { zh: 'Euler恒等式', en: "Euler's identity" } },
    { src: 'assets/formulas/cauchy.svg', name: { zh: 'Cauchy积分公式', en: "Cauchy's integral formula" } },
    { src: 'assets/formulas/nullstellensatz.svg', name: { zh: 'Hilbert零点定理', en: "Hilbert's Nullstellensatz" } },
    { src: 'assets/formulas/atiyah-singer.svg', name: { zh: 'Atiyah–Singer指标定理', en: 'Atiyah–Singer index theorem' } },
    { src: 'assets/formulas/hodge.svg', name: { zh: 'Hodge分解定理', en: 'Hodge decomposition theorem' } },
    { src: 'assets/formulas/yoneda.svg', name: { zh: 'Yoneda引理', en: 'Yoneda lemma' } },
  ];
  /* 首页几何速写图廊（TikZ 绘制的微分几何示意图，SVG 图片，双语图注） */
  const GEOFIGS = [
    { src: 'assets/figures/charts.svg', name: { zh: '坐标卡与图册', en: 'Charts and an atlas' }, note: { zh: '开覆盖、坐标卡与转移映射', en: 'Coordinate charts and transition maps' } },
    { src: 'assets/figures/tangent.svg', name: { zh: '切空间', en: 'Tangent space' }, note: { zh: '流形在一点的线性近似', en: 'Linear approximation at a point' } },
    { src: 'assets/figures/geodesic.svg', name: { zh: '测地线', en: 'Geodesics' }, note: { zh: '曲面上连接 A、B 的「最直」曲线 γ', en: 'The “straightest” curve γ from A to B' } },
    { src: 'assets/figures/curvature.svg', name: { zh: '曲率', en: 'Curvature' }, note: { zh: '球面 K>0 与鞍面 K<0', en: 'Sphere with K>0, saddle with K<0' } },
    { src: 'assets/figures/riemann-sphere.svg', name: { zh: '黎曼球面', en: 'Riemann sphere' }, note: { zh: '球极投影与无穷远点', en: 'Stereographic projection and the point at infinity' } },
    { src: 'assets/figures/torus.svg', name: { zh: '复环面', en: 'Complex torus' }, note: { zh: '格 Λ 的基本平行四边形（对边粘合）', en: 'Lattice Λ and its fundamental parallelogram' } },
  ];
  const LS_LANG = 'mathnotes-lang';
  const LS_THEME = 'mathnotes-theme';
  const page = document.body.dataset.page || '';
  let SITE = null;
  let MANIFEST = null;
  let lang = localStorage.getItem(LS_LANG) || 'zh';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) =>
    String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  const t = (k, vars) => {
    let s = (I18N[lang] && I18N[lang][k]) || I18N.zh[k] || k;
    if (vars) for (const a of Object.keys(vars)) s = s.split('{' + a + '}').join(vars[a]);
    return s;
  };

  /* ---------------- 主题 ---------------- */
  function currentTheme() {
    return localStorage.getItem(LS_THEME) ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function applyTheme() {
    const dark = currentTheme() === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    const btn = $('#themeBtn');
    if (btn) btn.textContent = dark ? '☀' : '☾';
  }
  function initTheme() {
    applyTheme();
    $('#themeBtn').addEventListener('click', () => {
      localStorage.setItem(LS_THEME, currentTheme() === 'dark' ? 'light' : 'dark');
      applyTheme();
    });
  }

  /* ---------------- 语言 ---------------- */
  function applyLang() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    const btn = $('#langBtn');
    if (btn) btn.textContent = lang === 'zh' ? 'EN' : '中';
    localStorage.setItem(LS_LANG, lang);
    if (!SITE) return;
    if (page === 'home') {
      const tg = $('#tagline');
      if (tg) tg.textContent = (SITE.tagline && SITE.tagline[lang]) || '';
      document.title = SITE.siteTitle;
    } else if (page === 'notes') {
      document.title = t('notes.title') + ' · ' + SITE.siteTitle;
    } else if (page === 'pdfs') {
      document.title = t('pdfs.title') + ' · ' + SITE.siteTitle;
    } else if (page === 'about') {
      document.title = t('about.title') + ' · ' + SITE.siteTitle;
    }
  }

  /* ---------------- Markdown + KaTeX ---------------- */
  function protectMarkdown(md) {
    const code = [], icode = [], math = [];
    md = md.replace(/```[^\n]*\n[\s\S]*?```/g, (m) => {
      code.push(m);
      return '@@CODE' + (code.length - 1) + '@@';
    });
    md = md.replace(/(?<![`\\])`([^`\n]+)`/g, (m, body) => {
      icode.push(body);
      return '@@ICODE' + (icode.length - 1) + '@@';
    });
    md = md.replace(/(?<!\\)\$\$([\s\S]+?)(?<!\\)\$\$/g, (m, tex) => {
      math.push({ tex: tex, display: true });
      return '@@M' + (math.length - 1) + '@@';
    });
    md = md.replace(/(?<!\\)\$([^$\n]+?)(?<!\\)\$/g, (m, tex) => {
      math.push({ tex: tex, display: false });
      return '@@M' + (math.length - 1) + '@@';
    });
    md = md.replace(/\\\$/g, '$');
    return { md: md, code: code, icode: icode, math: math };
  }
  function restoreMarkdown(html, p) {
    p.math.forEach((m, i) => {
      let out;
      try {
        out = katex.renderToString(m.tex, {
          displayMode: m.display,
          throwOnError: false,
          strict: 'ignore',
          trust: false,
        });
      } catch (e) {
        out = esc(m.tex);
      }
      html = html.split('@@M' + i + '@@').join(out);
    });
    p.code.forEach((c, i) => {
      const m = c.match(/^```([^\n]*)\n([\s\S]*)```$/);
      const info = m ? m[1].trim() : '';
      const body = m ? m[2] : c;
      const cls = info ? ' class="language-' + esc(info) + '"' : '';
      html = html.split('@@CODE' + i + '@@').join('<pre><code' + cls + '>' + esc(body) + '</code></pre>');
    });
    p.icode.forEach((c, i) => {
      html = html.split('@@ICODE' + i + '@@').join('<code>' + esc(c) + '</code>');
    });
    return html;
  }
  function renderMD(md) {
    const p = protectMarkdown(md);
    const html = marked.parse(p.md, { gfm: true, breaks: false });
    return restoreMarkdown(html, p);
  }
  function stripFront(md) {
    if (md.startsWith('---')) {
      const end = md.indexOf('\n---', 4);
      if (end !== -1) md = md.slice(end + 4).replace(/^\n+/, '');
    }
    return md;
  }

  /* ---------------- 工具 ---------------- */
  function groupItems(items, key) {
    const order = (SITE.categories || []).slice();
    const seen = new Set(order);
    items.forEach((it) => {
      if (!seen.has(it[key])) { order.push(it[key]); seen.add(it[key]); }
    });
    return order
      .map((c) => ({ cat: c, items: items.filter((it) => it[key] === c) }))
      .filter((g) => g.items.length > 0);
  }
  function noteItem(n) {
    return (
      '<li>' +
      '<a class="note-link" href="note.html?n=' + encodeURIComponent(n.slug) + '">' +
      '<span class="note-date">' + esc(n.date || '') + '</span>' +
      '<span class="note-title">' + esc(n.title) + '</span>' +
      '</a>' +
      (n.summary ? '<span class="note-summary">' + esc(n.summary) + '</span>' : '') +
      '</li>'
    );
  }
  function pdfItem(p) {
    return (
      '<li>' +
      '<a class="note-link" href="pdf.html?f=' + encodeURIComponent(p.slug) + '">' +
      '<span class="note-title">' + esc(p.title) + '</span>' +
      '<span class="pdf-size">' + esc(p.size) + '</span>' +
      '</a>' +
      '</li>'
    );
  }

  /* ---------------- 首页 ---------------- */
  function renderHome() {
    const counts = {};
    const hasNotes = new Set();
    const hasPdfs = new Set();
    MANIFEST.notes.forEach((n) => { counts[n.category] = (counts[n.category] || 0) + 1; hasNotes.add(n.category); });
    MANIFEST.pdfs.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; hasPdfs.add(p.category); });
    const cats = groupItems([].concat(MANIFEST.notes, MANIFEST.pdfs), 'category').map((g) => g.cat);
    $('#catGrid').innerHTML = cats
      .map((c) => {
        const href = hasNotes.has(c)
          ? 'notes.html?cat=' + encodeURIComponent(c)
          : 'pdfs.html?cat=' + encodeURIComponent(c);
        return (
          '<a class="cat-tile" href="' + href + '">' +
          '<span class="cat-name">' + esc(c) + '</span>' +
          '<span class="cat-count">' + (counts[c] || 0) + '</span>' +
          '</a>'
        );
      })
      .join('');
    const recent = MANIFEST.notes
      .filter((n) => n.date)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 6);
    const list = recent.length ? recent : MANIFEST.notes.slice(0, 6);
    $('#recentNotes').innerHTML = list.map(noteItem).join('');
    $('#papersLink').innerHTML =
      '<a href="pdfs.html">' + t('home.papers.more', { n: MANIFEST.pdfs.length }) + '</a>';
    const sf = $('#searchForm');
    if (sf && !sf.dataset.bound) {
      sf.dataset.bound = '1';
      sf.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = $('#searchInput').value.trim();
        location.href = 'notes.html' + (q ? '?q=' + encodeURIComponent(q) : '');
      });
    }
    /* 著名公式轮播（SVG 图片，所有浏览器显示一致，且不存在文本副本） */
    const wrap = $('#heroFormula');
    const body = $('#heroFormulaBody');
    const cap = $('#heroFormulaCaption');
    if (wrap && body && cap) {
      if (window.__formulaIdx == null) window.__formulaIdx = 0;
      if (!window.__svgCache) window.__svgCache = {};
      const show = (i) => {
        window.__formulaIdx = i;
        const f = FORMULAS[i % FORMULAS.length];
        if (window.__svgCache[f.src]) body.innerHTML = window.__svgCache[f.src];
        cap.textContent = f.name[lang] || f.name.zh;
      };
      const pending = FORMULAS.filter((f) => !window.__svgCache[f.src]);
      Promise.all(pending.map((f) =>
        fetch(f.src).then((r) => (r.ok ? r.text() : '')).then((t) => { if (t) window.__svgCache[f.src] = t; }).catch(() => {})
      )).then(() => show(window.__formulaIdx));
      if (!window.__formulaTimer) {
        window.__formulaTimer = setInterval(() => {
          const next = (window.__formulaIdx + 1) % FORMULAS.length;
          wrap.classList.add('fading');
          setTimeout(() => {
            show(next);
            wrap.classList.remove('fading');
          }, 450);
        }, 5000);
      }
    }
    /* 几何速写图廊（TikZ SVG，缓存后按语言渲染图注） */
    const geo = $('#geoGrid');
    if (geo) {
      if (!window.__svgCache) window.__svgCache = {};
      Promise.all(GEOFIGS.map((f) =>
        window.__svgCache[f.src]
          ? Promise.resolve()
          : fetch(f.src).then((r) => (r.ok ? r.text() : '')).then((t) => { if (t) window.__svgCache[f.src] = t; }).catch(() => {})
      )).then(() => {
        geo.innerHTML = GEOFIGS.map((f) =>
          '<figure class="geo-fig">' + (window.__svgCache[f.src] || '') +
          '<figcaption class="geo-cap">' +
          '<span class="geo-name">' + esc(f.name[lang] || f.name.zh) + '</span>' +
          '<span class="geo-note">' + esc(f.note[lang] || f.note.zh) + '</span>' +
          '</figcaption></figure>'
        ).join('');
      });
    }
  }

  /* ---------------- 笔记列表 ---------------- */
  function renderNotes() {
    const params = new URLSearchParams(location.search);
    let cat = params.get('cat') || '';
    let q = params.get('q') || '';
    const input = $('#noteSearch');
    if (input) input.value = q;
    if (input) input.addEventListener('input', draw);
    const chipsEl = $('#catChips');
    function drawChips() {
      const cats = groupItems(MANIFEST.notes, 'category').map((g) => g.cat);
      chipsEl.innerHTML =
        '<button class="chip' + (cat ? '' : ' active') + '" data-cat="">' + t('notes.all') + '</button>' +
        cats
          .map((c) => '<button class="chip' + (cat === c ? ' active' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>')
          .join('');
      $$('.chip', chipsEl).forEach((b) => {
        b.addEventListener('click', () => {
          cat = b.dataset.cat;
          drawChips();
          draw();
        });
      });
    }
    function draw() {
      const qq = (input ? input.value : q || '').trim().toLowerCase();
      const items = MANIFEST.notes.filter((n) => {
        const hay = [n.title, n.category, n.summary, (n.tags || []).join(' ')].join(' ').toLowerCase();
        return (!cat || n.category === cat) && (!qq || hay.includes(qq));
      });
      $('#noteGroups').innerHTML = groupItems(items, 'category')
        .map(
          (g) =>
            '<h2 class="group-title"><span class="group-name">' + esc(g.cat) + '</span>' +
            '<span class="group-count">' + g.items.length + '</span></h2>' +
            '<ul class="note-list">' + g.items.map(noteItem).join('') + '</ul>'
        )
        .join('');
      $('#searchEmpty').hidden = items.length > 0;
      $('#notesCount').textContent = t('notes.count', { n: MANIFEST.notes.length });
    }
    drawChips();
    draw();
  }

  /* ---------------- 单篇笔记 ---------------- */
  async function renderNote() {
    const slug = new URLSearchParams(location.search).get('n') || '';
    const note = MANIFEST.notes.find((n) => n.slug === slug);
    const el = $('#noteView');
    if (!note) {
      el.innerHTML = '<p class="empty" style="margin-top:60px">' + esc(t('err.notfound')) + '</p>';
      return;
    }
    let md;
    try {
      const r = await fetch(note.path);
      if (!r.ok) throw new Error('http');
      md = await r.text();
    } catch (e) {
      el.innerHTML = '<p class="empty" style="margin-top:60px">' + esc(t('err.load')) + '</p>';
      return;
    }
    const body = renderMD(stripFront(md));
    const chips = (note.tags || []).map((tg) => '<span class="chip chip-tag">' + esc(tg) + '</span>').join('');
    const edit = SITE.githubRepo
      ? '<a class="gh-link" target="_blank" rel="noopener" href="https://github.com/' +
        SITE.githubRepo + '/edit/main/' + note.path + '">' + t('note.edit') + '</a>'
      : '';
    el.innerHTML =
      '<p class="back"><a href="notes.html">' + t('note.back') + '</a></p>' +
      '<h1>' + esc(note.title) + '</h1>' +
      '<div class="note-meta">' +
      '<span>' + esc(note.category || t('cat.uncategorized')) + '</span>' +
      (note.date ? '<span>' + esc(note.date) + '</span>' : '') +
      '<span>' + chips + '</span>' +
      '<span class="note-meta-spacer"></span>' +
      edit +
      '</div>' +
      '<div class="prose-body">' + body + '</div>' +
      '<div class="endmark">∎</div>';
    document.title = note.title + ' · ' + SITE.siteTitle;
  }

  /* ---------------- 文献列表 ---------------- */
  function renderPdfs() {
    const params = new URLSearchParams(location.search);
    let cat = params.get('cat') || '';
    const input = $('#pdfSearch');
    if (input) input.addEventListener('input', draw);
    const chipsEl = $('#pdfChips');
    function drawChips() {
      const cats = groupItems(MANIFEST.pdfs, 'category').map((g) => g.cat);
      chipsEl.innerHTML =
        '<button class="chip' + (cat ? '' : ' active') + '" data-cat="">' + t('pdfs.all') + '</button>' +
        cats
          .map((c) => '<button class="chip' + (cat === c ? ' active' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>')
          .join('');
      $$('.chip', chipsEl).forEach((b) => {
        b.addEventListener('click', () => {
          cat = b.dataset.cat;
          drawChips();
          draw();
        });
      });
    }
    function draw() {
      const qq = (input ? input.value : '').trim().toLowerCase();
      const items = MANIFEST.pdfs.filter((p) => {
        const hay = [p.title, p.category, (p.tags || []).join(' ')].join(' ').toLowerCase();
        return (!cat || p.category === cat) && (!qq || hay.includes(qq));
      });
      $('#pdfGroups').innerHTML = groupItems(items, 'category')
        .map(
          (g) =>
            '<h2 class="group-title"><span class="group-name">' + esc(g.cat) + '</span>' +
            '<span class="group-count">' + g.items.length + '</span></h2>' +
            '<ul class="note-list">' + g.items.map(pdfItem).join('') + '</ul>'
        )
        .join('');
      $('#pdfEmpty').hidden = items.length > 0;
      $('#pdfsCount').textContent = t('pdfs.count', { n: MANIFEST.pdfs.length });
    }
    drawChips();
    draw();
  }

  /* ---------------- 文献阅读 ---------------- */
  function renderPdf() {
    const slug = new URLSearchParams(location.search).get('f') || '';
    const p = MANIFEST.pdfs.find((x) => x.slug === slug);
    const el = $('#pdfView');
    if (!p) {
      el.innerHTML = '<p class="empty" style="margin-top:60px">' + esc(t('err.notfound')) + '</p>';
      return;
    }
    const chips = (p.tags || []).map((tg) => '<span class="chip chip-tag">' + esc(tg) + '</span>').join('');
    const manage = SITE.githubRepo
      ? '<a class="gh-link" target="_blank" rel="noopener" href="https://github.com/' +
        SITE.githubRepo + '/tree/main/content/pdfs">' + t('pdf.manage') + '</a>'
      : '';
    el.innerHTML =
      '<p class="back"><a href="pdfs.html">' + t('pdf.back') + '</a></p>' +
      '<div class="pdf-head"><h1>' + esc(p.title) + '</h1></div>' +
      '<div class="note-meta">' +
      '<span>' + esc(p.category || t('cat.uncategorized')) + '</span>' +
      '<span>' + esc(p.size) + '</span>' +
      '<span>' + chips + '</span>' +
      '<span class="note-meta-spacer"></span>' +
      '<a class="gh-link" href="' + esc(p.path) + '" target="_blank" rel="noopener">' + t('pdf.download') + '</a>' +
      manage +
      '</div>' +
      '<iframe class="pdf-frame" src="' + esc(p.path) + '" title="' + esc(p.title) + '"></iframe>';
    document.title = p.title + ' · ' + SITE.siteTitle;
  }

  /* ---------------- 关于 ---------------- */
  async function renderAbout() {
    const el = $('#aboutView');
    try {
      const r = await fetch('content/about.md');
      if (!r.ok) throw new Error('http');
      el.innerHTML = renderMD(await r.text());
    } catch (e) {
      el.innerHTML = '<p class="empty" style="margin-top:60px">' + esc(t('err.load')) + '</p>';
    }
  }

  /* ---------------- 启动 ---------------- */
  const RENDER = { home: renderHome, notes: renderNotes, note: renderNote, pdfs: renderPdfs, pdf: renderPdf, about: renderAbout };
  function renderPage() {
    if (RENDER[page]) RENDER[page]();
  }
  async function boot() {
    applyTheme();
    try {
      const [s, m] = await Promise.all([
        fetch('data/site.json').then((r) => { if (!r.ok) throw new Error('http'); return r.json(); }),
        fetch('data/manifest.json').then((r) => { if (!r.ok) throw new Error('http'); return r.json(); }),
      ]);
      SITE = s;
      MANIFEST = m;
    } catch (e) {
      document.body.innerHTML =
        '<main class="wrap"><p class="empty" style="margin-top:80px">' + esc(t('err.load')) + '</p></main>';
      return;
    }
    $$('[data-site]').forEach((el) => {
      const v = SITE[el.dataset.site];
      if (v != null) el.textContent = v;
    });
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
    const repo = SITE.githubRepo;
    const rl = $('#repoLink');
    if (rl) {
      if (repo) {
        rl.href = 'https://github.com/' + repo;
        rl.hidden = false;
      } else {
        rl.remove();
      }
    }
    lang = localStorage.getItem(LS_LANG) || SITE.defaultLang || 'zh';
    initTheme();
    $('#langBtn').addEventListener('click', () => {
      lang = lang === 'zh' ? 'en' : 'zh';
      applyLang();
      renderPage();
    });
    applyLang();
    renderPage();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
