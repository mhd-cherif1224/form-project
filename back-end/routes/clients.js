const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const { reminderEvents } = require("../jobs/generateReminders");

router.get("/reminders/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // stops proxies from buffering the stream

    res.flushHeaders();

    // Tell the browser to retry quickly if the connection drops
    res.write("retry: 2000\n\n");

    const sendEvent = (data) => {
        res.write(`event: reminder-generated\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    reminderEvents.on("reminder-generated", sendEvent);

    // Heartbeat so Railway's proxy doesn't kill the connection as idle
    const heartbeat = setInterval(() => {
        res.write(":heartbeat\n\n");
    }, 20000);

    req.on("close", () => {
        clearInterval(heartbeat);
        reminderEvents.off("reminder-generated", sendEvent);
    });
});


const {
    createClient,
    getClients,
    updateClient,
    checkClient,
    getReminders,
    dismissReminder,
    setReminder
} = require("../controllers/clientsController");

router.delete("/reminders/:id", dismissReminder);
router.get("/reminders", getReminders);
router.get("/check", checkClient);
router.get("/", getClients);
router.post("/", createClient);
router.put("/:id/reminder", setReminder);
router.put("/:id", updateClient);



// Signup
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password required');
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).send('Username already taken');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await db.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, passwordHash]);

    res.status(201).send('Account created');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];

    if (!user) {
      return res.status(401).send('Invalid username or password');
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).send('Invalid username or password');
    }

    req.session.userId = user.id;
    res.send('Logged in');
  } catch (err) {
    console.error(err);
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