const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
const port = 3000;

// Middleware for parsing incoming requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set up session middleware
app.use(session({
  secret: 'your_secret_key', // Replace with a strong secret
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// MySQL connection setup
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'system',
  database: 'finance_advisor'
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Serve the login page as the default route
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard.html'); // Redirect to dashboard if logged in
  } else {
    res.sendFile(path.join(__dirname, 'public', 'login.html')); // Serve login.html if not logged in
  }
});

// Serve the login page explicitly
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve the dashboard page
app.get('/dashboard.html', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
  } else {
    res.redirect('/login.html');
  }
});

// API to get user information
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({
      username: req.session.user.username,
      email: req.session.user.email
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// API for user signup
app.post('/signup', (req, res) => {
  const { username, password, email } = req.body;

  // Hash the password before storing it
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;

    connection.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hash],
      (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Server error');
          return;
        }
        res.send('Signup successful');
      }
    );
  });
});

// API for user login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find the user by username
  connection.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err || result.length === 0) {
      return res.status(400).send('Invalid username or password');
    }

    const user = result[0];

    // Compare the password with the stored hash
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) throw err;
      if (match) {
        req.session.user = user; // Store user in session
        res.redirect('/dashboard.html'); // Redirect to dashboard on successful login
      } else {
        res.status(400).send('Invalid username or password');
      }
    });
  });
});

// API to get all expenses
app.get('/api/expenses', (req, res) => {
  if (req.session.user) {
    connection.query('SELECT * FROM expenses WHERE user_id = ?', [req.session.user.id], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server error');
        return;
      }
      res.json(results);
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// API to add a new expense
app.post('/api/expenses', (req, res) => {
  if (req.session.user) {
    const { date, amount, description } = req.body;

    connection.query(
      'INSERT INTO expenses (user_id, date, amount, description) VALUES (?, ?, ?, ?)',
      [req.session.user.id, date, amount, description],
      (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send('Server error');
          return;
        }

        // Send the new expense data back to the client
        res.json({
          success: true,
          date,
          description,
          amount
        });
      }
    );
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// API to get latest transactions
app.get('/api/transactions', (req, res) => {
  if (req.session.user) {
    connection.query('SELECT * FROM transactions WHERE user_id = ?', [req.session.user.id], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server error');
        return;
      }
      res.json(results);
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Logout endpoint
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.redirect('/login.html');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
