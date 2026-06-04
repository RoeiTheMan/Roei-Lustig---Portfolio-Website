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

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    const safePath = path.normalize(urlPath).replace(/^([/\\])+/, "");
    let filePath = path.join(ROOT, safePath);

    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403); res.end("Forbidden"); return;
    }

    fs.stat(filePath, (err, stat) => {
      if (err) { res.writeHead(404); res.end("Not found"); return; }

      if (stat.isDirectory()) filePath = path.join(filePath, "index.html");

      fs.stat(filePath, (err2, fileStat) => {
        if (err2) { res.writeHead(404); res.end("Not found"); return; }

        const ext  = path.extname(filePath).toLowerCase();
        const type = MIME[ext] || "application/octet-stream";
        const size = fileStat.size;
        const rangeHeader = req.headers["range"];

        if (rangeHeader) {
          const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
          if (match) {
            const start = match[1] !== "" ? parseInt(match[1], 10) : 0;
            const end   = match[2] !== "" ? parseInt(match[2], 10) : size - 1;
            if (start > end || end >= size) {
              res.writeHead(416, { "Content-Range": `bytes */${size}` });
              res.end(); return;
            }
            res.writeHead(206, {
              "Content-Type":   type,
              "Content-Range":  `bytes ${start}-${end}/${size}`,
              "Content-Length": end - start + 1,
              "Accept-Ranges":  "bytes",
              "Cache-Control":  "no-store",
            });
            fs.createReadStream(filePath, { start, end }).pipe(res);
            return;
          }
        }

        res.writeHead(200, {
          "Content-Type":   type,
          "Content-Length": size,
          "Accept-Ranges":  "bytes",
          "Cache-Control":  "no-store",
        });
        fs.createReadStream(filePath).pipe(res);
      });
    });
  } catch {
    res.writeHead(500); res.end("Server error");
  }
});

server.listen(PORT, () => {
  console.log(`Serving ${ROOT} at http://localhost:${PORT}`);
});
