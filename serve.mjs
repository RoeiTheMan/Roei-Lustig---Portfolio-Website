import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const PORT = 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".htm":  "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".mjs":  "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico":  "image/x-icon",
  ".mp4":  "video/mp4",
  ".webm": "video/webm",
  ".mov":  "video/quicktime",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".ttf":  "font/ttf",
  ".otf":  "font/otf",
  ".txt":  "text/plain; charset=utf-8",
  ".map":  "application/json; charset=utf-8"
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "Cache-Control": "no-store", ...headers });
  res.end(body);
}

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    const safePath = path.normalize(urlPath).replace(/^([/\\])+/, "");
    let filePath = path.join(ROOT, safePath);

    if (!filePath.startsWith(ROOT)) {
      return send(res, 403, "Forbidden");
    }

    fs.stat(filePath, (err, stat) => {
      if (err) return send(res, 404, "Not found");
      if (stat.isDirectory()) filePath = path.join(filePath, "index.html");

      fs.readFile(filePath, (err2, data) => {
        if (err2) return send(res, 404, "Not found");
        const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
        send(res, 200, data, { "Content-Type": type });
      });
    });
  } catch {
    send(res, 500, "Server error");
  }
});

server.listen(PORT, () => {
  console.log(`Serving ${ROOT} at http://localhost:${PORT}`);
});
