import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
// use global fetch available in Node 18+
const fetch = globalThis.fetch;
import swaggerJSDoc from 'swagger-jsdoc';
// Prevent app.js from starting the main HTTP/HTTPS servers when importing
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
import app from '../app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sampleFromSchema(schema) {
  if (!schema) return {};
  if (schema.example) return schema.example;
  if (schema.type === 'object' && schema.properties) {
    const out = {};
    for (const [k, v] of Object.entries(schema.properties)) {
      if (v.example !== undefined) out[k] = v.example;
      else if (v.type === 'string') out[k] = v.default || 'example';
      else if (v.type === 'integer' || v.type === 'number') out[k] = v.default || 1;
      else if (v.type === 'boolean') out[k] = v.default || false;
      else if (v.type === 'array') out[k] = v.items && v.items.example ? [v.items.example] : [];
      else out[k] = v.default || null;
    }
    return out;
  }
  if (schema.type === 'array' && schema.items) return [sampleFromSchema(schema.items)];
  if (schema.type === 'string') return 'example';
  if (schema.type === 'integer' || schema.type === 'number') return 1;
  if (schema.type === 'boolean') return false;
  return {};
}

async function run() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  try {
    console.log('Starting swagger spec generation...');
    const options = {
      definition: {
        openapi: '3.0.3',
        info: { title: 'Local API', version: '1.0.0' },
        servers: [{ url: base + '/api' }],
      },
      apis: [path.resolve(__dirname, '../routes/*.js')],
    };

    const spec = swaggerJSDoc(options);
    const paths = spec.paths || {};

    // Login admin to get token if auth present
    let token = null;
    try {
      const r = await fetch(base + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@maets.com', password: 'password' }),
      });
      if (r.ok) {
        const j = await r.json().catch(() => null);
        token = j?.token;
        console.log('Got admin token');
      } else {
        console.log('Admin login failed with', r.status);
      }
    } catch (e) {
      console.warn('Admin login error', e.message);
    }

    console.log('Found', Object.keys(paths).length, 'paths in swagger spec');

    for (const [route, methods] of Object.entries(paths)) {
      for (const [method, op] of Object.entries(methods)) {
        const httpMethod = method.toUpperCase();

        // Only execute safe, non-mutating methods to avoid side-effects
        if (httpMethod !== 'GET' && httpMethod !== 'HEAD' && httpMethod !== 'OPTIONS') {
          console.log(`SKIP ${httpMethod} ${route} (non-safe)`);
          continue;
        }
        let routePath = route.replace(/\{([^}]+)\}/g, '1'); // replace path params with 1
        const url = base + '/api' + routePath;

        let body = null;
        if (op.requestBody) {
          const content = op.requestBody.content || {};
          const jsonSchema = (content['application/json'] && content['application/json'].schema) || null;
          body = sampleFromSchema(jsonSchema) || {};
        }

        const headers = { Accept: 'application/json' };
        if (body) headers['Content-Type'] = 'application/json';
        if (op.security && token) headers['Authorization'] = `Bearer ${token}`;

        try {
          const resp = await fetch(url, { method: httpMethod, headers, body: body ? JSON.stringify(body) : undefined });
          const text = await resp.text();
          console.log(`${httpMethod} ${url} -> ${resp.status}`);
          console.log(text.length > 500 ? text.slice(0, 500) + '... (truncated)' : text);
        } catch (err) {
          console.error(`${httpMethod} ${url} -> ERROR:`, err.message);
        }
      }
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

run();
