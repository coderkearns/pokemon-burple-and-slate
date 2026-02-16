const db = require('./src/db');
const { fetchPokemonFromApi } = require('./src/pokemon');
const server = require('./src/server');
const bot = require('./src/bot');

async function start() {
  // Load (and auto-create) data files
  await db.load();

  // Fetch real Pokemon from PokeAPI if the local list is empty
  await fetchPokemonFromApi();

  // Start Express web server
  server.start();

  // Start Discord bot
  await bot.login();
}

start().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
