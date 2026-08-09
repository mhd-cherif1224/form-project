// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/db');

const dbPromise = db.promise(); // ADD THIS — wraps the callback connection in a promise interface

// Signup
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password required');
  }

  try {
    const [existing] = await dbPromise.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).send('Username already taken');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await dbPromise.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, passwordHash]);

    res.status(201).send('Account created');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Login
r// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log("1 - LOGIN REQUEST:", username);

  try {
    console.log("2 - SEARCHING DATABASE...");

    const [rows] = await dbPromise.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    console.log("3 - USERS FOUND:", rows.length);

    const user = rows[0];

    if (!user) {
      console.log("4 - USER NOT FOUND");

      return res.status(401).send('Invalid username or password');
    }

    console.log("4 - USER FOUND:", user.username);
    console.log("5 - STORED HASH:", user.password_hash);
    console.log("6 - CHECKING PASSWORD...");

    const match = await bcrypt.compare(
      password,
      user.password_hash
    );

    console.log("7 - PASSWORD MATCH:", match);

    if (!match) {
      console.log("8 - INVALID PASSWORD");

      return res.status(401).send('Invalid username or password');
    }

    console.log("8 - PASSWORD CORRECT");
    console.log("9 - CREATING SESSION...");

    req.session.userId = user.id;

    console.log("10 - SESSION CREATED:", req.session.userId);

    res.send('Logged in');

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    res.status(500).send('Server error');
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Could not log out');
    res.clearCookie('connect.sid');
    res.send('Logged out');
  });
});

module.exports = router;