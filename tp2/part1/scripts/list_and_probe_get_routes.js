import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
// Ensure we don't start main servers in app.js
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
import app from '../app.js';

function extractRoutes(app) {
  const routes = [];
  function processStack(stack, prefix = '') {
    for (const layer of stack) {
      if (layer.route && layer.route.path) {
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
        routes.push({ path: prefix + layer.route.path, methods });
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        // router mounted at path
        const mountPath = layer.regexp && layer.regexp.source
          ? '' // fallback; express regexp to path is complex; rely on prefix from parent
          : '';
        processStack(layer.handle.stack, prefix);
      }
    }
  }
  if (app._router && app._router.stack) processStack(app._router.stack, '');
  return routes;
}

async function run() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  try {
    console.log('Listening ephemeral on', base);
    const routes = extractRoutes(app);
    console.log(`Found ${routes.length} registered route entries (raw).`);

    // Try to get an admin token (best-effort)
    let token = null;
    try {
      const login = await fetch(base + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@maets.com', password: 'password' }),
      });
      if (login.ok) {
        const j = await login.json().catch(() => null);
        token = j?.token;
        console.log('Got admin token');
      }
    } catch (e) {
      // ignore
    }

    for (const r of routes) {
      console.log('\nRoute:', r.path, 'Methods:', r.methods.join(', '));
      if (r.methods.includes('GET')) {
        // replace path params {id} or :id with 1
        const urlPath = r.path.replace(/:\w+|\{[^}]+\}/g, '1');
        const url = base + (urlPath.startsWith('/') ? urlPath : '/' + urlPath);
        try {
          const resp = await fetch(url, { headers: { Accept: 'application/json', Authorization: token ? `Bearer ${token}` : '' } });
          const text = await resp.text().catch(() => '');
          console.log(`GET ${url} -> ${resp.status}`);
          console.log(text.length > 400 ? text.slice(0, 400) + '... (truncated)' : text);
        } catch (err) {
          console.error(`GET ${url} -> ERROR: ${err.message}`);
        }
      } else {
        console.log('No GET -> skip probe');
      }
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
    console.log('Server closed');
  }
}

run().catch((e) => { console.error('Script error:', e); process.exit(1); });
