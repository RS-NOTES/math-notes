---
title: 如何编辑与上传笔记
category: 指南
tags: ["指南", "Markdown", "LaTeX"]
summary: 本网站的编辑与发布说明：如何新增、修改笔记，如何上传 PDF。
---

# 如何编辑与上传笔记

## 一、基本结构

本站由两类内容构成：

- **笔记**：位于 `content/notes/` 的 Markdown 文件（`.md`）；
- **文献（PDF）**：位于 `content/pdfs/` 的 PDF 文件，可配合 `meta.json` 填写标题与分类。

## 二、新增一篇笔记

1. 在 GitHub 仓库中进入 `content/notes/` 目录，点 **Add file → Create new file**；
2. 文件名建议用英文或拼音，例如 `fixed_point.md`；
3. 文件开头写上元信息：

```text
---
title: 压缩映射原理
category: 泛函分析
tags: ["不动点", "完备度量空间"]
summary: 完备度量空间中压缩映射的 Banach 不动点定理。
---
```

4. 正文用 Markdown 书写，数学公式用 `$...$`（行内）或 `$$...$$`（独立成行）：

行内公式 $e^{i\pi}+1=0$，独立公式：

$$
\mathrm{Ric} \geq 0 \;\Longrightarrow\; \mathrm{diam}(M) \leq \pi
$$

## 三、定理环境

在 Markdown 中直接写 HTML 标签，即可获得类似 LaTeX 的环境效果：

<div class="thm">
<p class="thm-head">定理（Banach 压缩映射原理）.</p>
设 $(X,d)$ 是完备度量空间，$T \colon X \to X$ 满足 $d(Tx, Ty) \le k\, d(x,y)$（$0 \le k < 1$），则 $T$ 有唯一不动点。
</div>

<div class="proof">
<p class="proof-head">证明.</p>
任取 $x_0 \in X$，令 $x_{n+1} = T x_n$。由归纳得 $d(x_{n+1}, x_n) \le k^n\, d(x_1, x_0)$，故 $\{x_n\}$ 是 Cauchy 列。由完备性，$x_n \to x$，且 $x = \lim Tx_n = Tx$。唯一性：若 $Tx = x$、$Ty = y$，则 $d(x,y) \le k\, d(x,y)$，故 $x = y$。
</div>

<div class="def">
<p class="def-head">定义（Lipschitz 映射）.</p>
若存在 $L \ge 0$ 使 $d(fx, fy) \le L\, d(x,y)$ 对一切 $x, y$ 成立，则称 $f$ 为 $L$-Lipschitz 映射。
</div>

<div class="rem">
<p class="rem-head">注记.</p>
条件 $k < 1$ 不可省：平移 $f(x) = x + 1$ 在 $\mathbb R$ 上没有不动点。
</div>

## 四、上传 PDF

1. 进入 `content/pdfs/`，点 **Add file → Upload files**，把 PDF 拖进去；
2. （可选）编辑 `content/pdfs/meta.json`，为该文件补充标题、分类与标签：

```json
{
  "fixed_point.pdf": { "title": "压缩映射原理", "category": "泛函分析", "tags": ["不动点"] }
}
```

3. 提交后约一分钟，GitHub Actions 自动重建并发布，刷新页面即可看到。

## 五、本地预览

在自己的电脑上运行：

```bash
node scripts/serve.mjs
```

然后浏览器打开 `http://127.0.0.1:8080`。

## 六、其他操作

- 修改内容：GitHub 上打开文件 → 铅笔图标编辑 → Commit changes；
- 删除文件：GitHub 上打开文件 → 垃圾桶图标 → Commit changes；
- 修改站名、署名：编辑根目录的 `config.json`。

每次提交都会自动触发重新发布，无需其他操作。
