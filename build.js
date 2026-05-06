import fs from 'fs';
import path from 'path';

const IGNORE = new Set([
  'node_modules', '.git', 'src', 'dist', '.env', '.env.local',
  '.env.development', '.env.production', '.vercel', '.kilo', '.qodo',
  'tmp-dashboard', 'tmp-login', 'login-pagetailwind', 'dashboard code',
  'project-management-dashboard-ui', 'lumosine-clone', 'amoria', 'about-us',
  'database.sqlite', 'db_fallback.json', 'server.js', 'railway.json',
  'Dockerfile', 'build.js', 'updateHtml.js', 'rebrand.cjs', 'rebrand-about.cjs',
  'new_loader.txt', 'temp_loader.txt', 'finland.txt', 'README.md',
  'package.json', 'package-lock.json', 'vite.config.js', 'eslint.config.js',
  'dashboard.css', 'dashboard.js', 'Dashboard.png', '17.04.2026_09.07.35_REC.mp4',
  '.dockerignore', '.gitignore', '.vercelignore'
]);

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (IGNORE.has(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync('dist')) fs.rmSync('dist', { recursive: true });
copyDir('.', 'dist');
console.log('Build complete: static files copied to dist/');
