import https from 'https';

const checks = [
  '/',
  '/assets/ethiopiaemblem.svg',
  '/assets/illuminativid.mp4',
  '/fonts/AMORIA.otf',
  '/login',
  '/register',
  '/dashboard'
];

for (const path of checks) {
  await new Promise(resolve => {
    https.get('https://illuminati-pi.vercel.app' + path, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const etag = res.headers['etag'] || 'none';
        const cache = res.headers['x-vercel-cache'] || 'none';
        console.log(`${path} => ${res.statusCode} | etag: ${etag.substring(0,16)} | cache: ${cache}`);
        if (path === '/') {
          const hasVideo = d.includes('illuminativid.mp4');
          const hasEmblem = d.includes('ethiopiaemblem.svg');
          const hasAmoria = d.includes('AMORIA.otf');
          console.log(`  Video: ${hasVideo} | Emblem: ${hasEmblem} | Font: ${hasAmoria}`);
        }
        resolve();
      });
    }).on('error', e => { console.log(`${path} => Error: ${e.message}`); resolve(); });
  });
}
