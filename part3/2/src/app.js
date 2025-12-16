const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const Pyroscope = require('@pyroscope/nodejs');
const { trace, context } = require('@opentelemetry/api');

require('./otel.js');

app.use(express.urlencoded({ extended: true }));

/* ---------------- Pyroscope ---------------- */
Pyroscope.init({
  serverAddress: 'http://pyroscope:4040',
  appName: 'shitty_app',
  wall: {
    collectCpuTime: true,
  },
});
Pyroscope.start();

/* ---------------- Express Middleware for Route Tracing ---------------- */

app.use((req, res, next) => {
  const tracer = trace.getTracer('express-tracer');
  const spanName = `${req.method} ${req.path}`;
  
  // Create a new span for this request
  const span = tracer.startSpan(spanName, {
    attributes: {
      'http.method': req.method,
      'http.target': req.path,
      'http.route': req.path,
      'http.host': req.get('host'),
      'http.user_agent': req.get('user-agent'),
    }
  });
  
  const ctx = trace.setSpan(context.active(), span);
  context.bind(req, ctx);
  
  const startHr = process.hrtime.bigint();
  const memBefore = process.memoryUsage().heapUsed;
  
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startHr) / 1e6;
    const memAfter = process.memoryUsage().heapUsed;
    
    span.setAttributes({
      'http.duration_ms': durationMs,
      'http.heap_delta_kb': (memAfter - memBefore) / 1024,
      'http.status_code': res.statusCode,
      'http.status_text': res.statusMessage,
      'http.content_length': res.get('content-length') || 0,
    });
    
    span.end();
  });
  
  Pyroscope.wrapWithLabels({ 'http.route': req.path }, () => {
    next();
  });
});

/* ---------------- Database ---------------- */

let pool;

async function waitForDB() {
  for (let i = 0; i < 30; i++) {
    try {
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306,
      });

      await conn.query(
        `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'appdb'}\``
      );
      await conn.end();

      pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'appdb',
        port: process.env.DB_PORT || 3306,
      });

      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          pseudo VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('Database ready');
      return;
    } catch (err) {
      console.log(`Waiting for database... (${i + 1}/30)`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error('Database connection failed');
}

app.use((req, res, next) => {
  if (!pool) {
    res.send(`
      <h1>Starting up...</h1>
      <p>Please wait for database connection</p>
      <script>setTimeout(() => location.reload(), 2000)</script>
    `);
    return;
  }
  next();
});

/* ---------------- Routes with explicit tracing ---------------- */

app.get('/', async (req, res) => {
  // Get current span and add route-specific attributes
  const span = trace.getSpan(context.active());
  if (span) {
    span.updateName('GET / (home)');
    span.setAttribute('route.name', 'homepage');
  }
  
  try {
    const [users] = await pool.query(
      'SELECT * FROM users ORDER BY id DESC'
    );

    let userList = '<p>No users yet</p>';
    if (users.length > 0) {
      userList = users
        .map(
          (u) => `<li>${u.id}: ${u.pseudo} (${u.created_at})</li>`
        )
        .join('');
    }

    res.send(`
      <h1>Simple DB App</h1>
      <img src="https://http.cat/images/200.jpg">
      <h2>Add User</h2>
      <form method="POST" action="/add">
        <input type="text" name="pseudo" required>
        <button>Add</button>
      </form>
      <h2>Users (${users.length})</h2>
      <ul>${userList}</ul>
    `);
  } catch (err) {
    if (span) {
      span.setAttribute('db.error', err.message);
      span.setStatus({ code: trace.SpanStatusCode.ERROR, message: err.message });
    }
    res.status(500).send('Database error');
  }
});

app.post('/add', async (req, res) => {
  // Get current span and add route-specific attributes
  const span = trace.getSpan(context.active());
  if (span) {
    span.updateName('POST /add');
    span.setAttribute('route.name', 'add_user');
    span.setAttribute('user.pseudo', req.body.pseudo);
  }
  
  try {
    await pool.query(
      'INSERT INTO users (pseudo) VALUES (?)',
      [req.body.pseudo]
    );
    
    if (span) {
      span.setAttribute('db.operation', 'INSERT');
    }
    
    res.redirect('/');
  } catch (err) {
    if (span) {
      span.setAttribute('db.error', err.message);
      span.setStatus({ code: trace.SpanStatusCode.ERROR, message: err.message });
    }
    res.status(500).send('Failed to add user');
  }
});

/* ---------------- Startup ---------------- */

const port = process.env.PORT || 3000;

waitForDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start:', err);
  });
