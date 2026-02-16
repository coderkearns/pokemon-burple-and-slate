const express = require('express');
const path = require('path');
const config = require('./config');
const db = require('./db');
const { client, currentSpawns, spawnPokemon } = require('./bot');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Auth helper ---

function authenticate(req) {
  const { username, password } = req.query || {};
  if (username && password) {
    return username === config.adminUsername && password === config.adminPassword;
  }

  const authHeader = req.headers.authorization;
  if (authHeader) {
    const base64 = authHeader.split(' ')[1] || '';
    const decoded = Buffer.from(base64, 'base64').toString('ascii');
    const [user, pass] = decoded.split(':');
    return user === config.adminUsername && pass === config.adminPassword;
  }

  // Check body for POST requests
  if (req.body) {
    return req.body.username === config.adminUsername && req.body.password === config.adminPassword;
  }

  return false;
}

// --- Routes ---

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// API: Get bot stats (requires authentication)
app.get('/api/stats', (req, res) => {
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const usersData = db.getUsersData();
  const totalUsers = Object.keys(usersData.users).length;
  const totalCatches = Object.values(usersData.users).reduce((sum, u) => sum + u.catches, 0);

  res.json({
    totalUsers,
    totalCatches,
    activeSpawns: currentSpawns.size,
    botStatus: client.isReady() ? 'online' : 'offline',
    guilds: client.guilds.cache.size,
    channels: client.channels.cache.size,
  });
});

// API: Get all users (requires authentication)
app.get('/api/users', (req, res) => {
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(db.getUsersData());
});

// API: Spawn Pokemon in a specific channel (requires authentication)
app.post('/api/spawn', async (req, res) => {
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { channelId } = req.body;
  try {
    const channel = client.channels.cache.get(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    await spawnPokemon(channel);
    res.json({ success: true, message: 'Pokemon spawned successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function start() {
  app.listen(config.port, () => {
    console.log(`✅ Web server running on http://localhost:${config.port}`);
  });
}

module.exports = { app, start };
