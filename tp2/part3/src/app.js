const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

app.use(express.urlencoded({ extended: true }));

let pool;

// Pire méthode pour attendre une DB, ne faites pas ça chez vous les enfants
async function waitForDB() {
  for (let i = 0; i < 30; i++) {
    try {
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306
      });
      
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'appdb'}\``);
      await conn.end();
      
      pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'appdb',
        port: process.env.DB_PORT || 3306
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
      console.log(`Waiting for database... (${i+1}/30)`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error('Database connection failed');
}

app.use(async (req, res, next) => {
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

app.get('/', async (req, res) => {
  const [users] = await pool.query('SELECT * FROM users ORDER BY id DESC');
  
  let userList = '<p>No users yet</p>';
  if (users.length > 0) {
    userList = users.map(u => `<li>${u.id}: ${u.pseudo} (${u.created_at})</li>`).join('');
  }
  
  // j'ai dit inline html parce que j'ai la flemme. Mon LLM aussi il a la flemme.
  res.send(`
    <h1>Simple DB App</h1>
      <img src="https://http.cat/images/200.jpg" alt="HTTP Cat 200 - OK">
    <h2>Add User</h2>
    <form method="POST" action="/add">
      <input type="text" name="pseudo" placeholder="Enter pseudo" required>
      <button>Add</button>
    </form>
    
    <h2>Users (${users.length})</h2>
    <ul>${userList}</ul>
    
    <style>
      body { font-family: Arial; padding: 20px; }
      input { padding: 8px; margin-right: 10px; }
      button { padding: 8px 15px; }
      ul { list-style: none; padding: 0; }
      li { padding: 5px; background: #f0f0f0; margin: 5px 0; }
    </style>
  `);
});

// allez là, pas d'ORM, quedal, juste on copie l'entrée utilisateur dans une requête SQL
// on est sur des bonnes pratiques de sécu ici (oupa)
app.post('/add', async (req, res) => {
  await pool.query('INSERT INTO users (pseudo) VALUES (?)', [req.body.pseudo]);
  res.redirect('/');
});

const port = process.env.PORT || 3000;

waitForDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to start:', err);
});
