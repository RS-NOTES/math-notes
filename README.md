# RS的数学空间 · 个人数学网站

一个极简学术风格的个人数学网站：笔记用 **Markdown + LaTeX** 写作（KaTeX 渲染），PDF 文献可在线阅读；支持中英双语界面切换与明暗主题。纯静态站点，零服务器成本，托管于 GitHub Pages，公开可访问。

## 功能

- 📝 笔记：`content/notes/` 下的 Markdown 文件，支持行内/独立 LaTeX 公式、定理环境；
- 📄 文献：`content/pdfs/` 下的 PDF，自动生成列表、分类，可在站内直接阅读或下载；
- 🔍 搜索与分类浏览（笔记 / 文献各自独立筛选）；
- 🌐 中英界面一键切换（浏览器记住选择）；☀️/☾ 明暗主题；
- ✏️ 每篇文章带「在 GitHub 上编辑此页」直达链接，改完自动重新发布。

## 目录结构

```
mathsite/
├─ index.html           首页（分类、最近笔记、文献入口、搜索）
├─ notes.html           笔记列表        note.html  笔记阅读页
├─ pdfs.html            文献列表        pdf.html   文献阅读页（内嵌 PDF 浏览器）
├─ about.html           关于页（内容来自 content/about.md）
├─ config.json          站点配置：站名、署名、分类顺序、GitHub 仓库名
├─ content/
│  ├─ notes/*.md        你的笔记（Markdown + LaTeX）
│  ├─ pdfs/*.pdf        你的文献
│  ├─ pdfs/meta.json    （可选）PDF 的标题/分类/标签覆盖表
│  └─ about.md          关于页内容
├─ data/                由 scripts/build.mjs 自动生成（site.json、manifest.json）
├─ assets/              样式、脚本、字体、KaTeX（全部本地化，不依赖 CDN）
├─ scripts/
│  ├─ build.mjs         扫描 content/ 生成站点清单（本地或 CI 均可运行）
│  ├─ serve.mjs         零依赖本地预览服务器
│  └─ fetch-vendor.mjs  （一次性）下载 KaTeX/marked/字体到本地
└─ .github/workflows/pages.yml   GitHub Pages 自动发布
```

## 本地预览

需要 Node.js（≥ 18）：

```bash
node scripts/build.mjs     # 生成清单（首次或增删内容后）
node scripts/serve.mjs     # 启动预览
```

浏览器打开 http://127.0.0.1:8080 。

> 注意：不要直接双击打开 `index.html`——浏览器会因安全限制无法加载数据文件，请通过上面的本地服务器访问。

## 发布到 GitHub Pages（让别人通过链接访问）

### 第一步：创建 GitHub 账号与仓库

1. 注册/登录 [github.com](https://github.com)；
2. 右上角 **+ → New repository**，仓库名例如 `math-notes`，选择 **Public**（免费公开），不勾选任何初始化文件，点 Create；
3. 进入仓库 **Settings → Pages**，在 *Build and deployment* 下把 **Source 设为 GitHub Actions**。

### 第二步：把本站文件夹推送到仓库（二选一）

**方式 A：GitHub Desktop（图形界面，推荐）**

1. 下载安装 [GitHub Desktop](https://desktop.github.com/) 并登录；
2. **File → Add local repository…** 选择本 `mathsite` 文件夹；
3. 提示 *This directory does not appear to be a Git repository* 时点 **create a repository**，再点 **Publish repository**（名称填刚才建的仓库名）；
4. 之后每次改动后：在左侧勾选文件 → 底部填写说明 → **Commit to main** → **Push origin**。

**方式 B：命令行 Git**

```bash
# 先安装 Git：winget install Git.Git
cd mathsite
git init
git add .
git commit -m "初始版本"
git branch -M main
git remote add origin https://github.com/你的用户名/math-notes.git
git push -u origin main
```

### 第三步：确认上线

推送后 GitHub 会自动运行 Actions（约 1 分钟）构建并发布。之后你的网站地址是：

```
https://你的用户名.github.io/math-notes/
```

把这个链接发给任何人即可直接访问。

## 日常使用

| 想做什么 | 怎么做 |
| --- | --- |
| 改站名 / 署名 | 编辑根目录 `config.json`（`siteTitle`、`author` 等） |
| 新增笔记 | GitHub 网页：`content/notes/` → **Add file → Create new file**，写 Markdown（头部格式见 `content/notes/how-to.md`） |
| 改笔记 | 打开笔记 → 右上角铅笔图标 → 改 → Commit；或在站内文章页点「在 GitHub 上编辑此页」 |
| 上传 PDF | GitHub 网页：`content/pdfs/` → **Add file → Upload files**，拖入 PDF |
| 给 PDF 写标题/分类 | 编辑 `content/pdfs/meta.json`（格式见文件内说明）；缺省时按文件名自动推断 |
| 删除内容 | 打开对应文件 → 垃圾桶图标 → Commit |

每次提交都会自动触发重新发布，无需任何额外操作。

## 常见问题

- **为什么打不开网站？** 确认仓库是 Public；确认 Settings → Pages 的 Source 是 GitHub Actions；第一次发布后稍等 1–2 分钟。
- **公式不显示？** 本站资源全部本地化，与网络无关；若看到原始 `$...$`，请确认是通过服务器访问（见「本地预览」提示）。
- **想改分类？** 编辑 `config.json` 的 `categories` 数组（决定显示顺序），笔记分类在每篇 `.md` 的头部 `category:` 字段，PDF 分类在 `content/pdfs/meta.json`。
