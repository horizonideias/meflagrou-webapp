const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8085;
const DIST_DIR = path.join(__dirname, 'dist');
const ZIP_FILE = path.join(__dirname, 'dist-meflagrou-producao.zip');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.url === '/dist.zip') {
    const file = fs.readFileSync(ZIP_FILE);
    res.writeHead(200, { 'Content-Type': 'application/zip', 'Content-Length': file.length });
    return res.end(file);
  }

  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';
  const content = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(content);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Serve dist running on port ${PORT}`);
});
