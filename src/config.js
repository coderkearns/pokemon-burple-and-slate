require('dotenv').config();

const config = {
  // Discord
  discordToken: process.env.DISCORD_TOKEN,
  discordClientId: process.env.DISCORD_CLIENT_ID,

  // Web Server
  port: parseInt(process.env.PORT, 10) || 3000,
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'changeme',

  // Bot
  prefix: process.env.BOT_PREFIX || '!',
  spawnMinInterval: parseInt(process.env.POKEMON_SPAWN_MIN_INTERVAL, 10) || 300000,
  spawnMaxInterval: parseInt(process.env.POKEMON_SPAWN_MAX_INTERVAL, 10) || 900000,
  spawnTimeout: parseInt(process.env.POKEMON_SPAWN_TIMEOUT, 10) || 300000,

  // Data
  dataDir: process.env.DATA_DIR || './data',

  // Pokemon
  maxPokemonId: parseInt(process.env.MAX_POKEMON_ID, 10) || 493, // Gen 1-4 (Diamond and earlier)
};

module.exports = config;
