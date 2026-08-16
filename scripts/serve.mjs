// 本地预览服务器（零依赖）
// 运行：node scripts/serve.mjs   →   http://127.0.0.1:8080
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 8080);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json',
};

const server = createServer(async (req, res) => {
  try {
    let urlPath;
    try { urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400).end('Bad Request'); return; }
    if (urlPath.endsWith('/')) urlPath += 'index.html';
    let filePath = path.normalize(path.join(root, urlPath));
    if (filePath !== root && !filePath.startsWith(root + path.sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    let data;
    try {
      data = await readFile(filePath);
    } catch {
      if (!path.extname(filePath)) {
        try {
          filePath += '.html';
          data = await readFile(filePath);
        } catch {
          notFound(res); return;
        }
      } else {
        notFound(res); return;
      }
    }
    const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    res.end(data);
  } catch (e) {
    res.writeHead(500).end('Server Error');
  }
});
function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<!DOCTYPE html><html><body><h1>404</h1></body></html>');
}
server.listen(PORT, '127.0.0.1', () => {
  console.log('数学笔记 · 本地预览已启动');
  console.log(`打开浏览器访问: http://127.0.0.1:${PORT}`);
});
