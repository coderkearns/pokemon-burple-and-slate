const fs = require('fs').promises;
const path = require('path');
const config = require('./config');

const DEFAULTS = {
  'users.json': { users: {} },
  'pokemon.json': { pokemon: [] },
};

let data = {
  pokemon: null,
  users: null,
};

async function ensureFile(filename) {
  const filePath = path.join(config.dataDir, filename);
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(DEFAULTS[filename] || {}, null, 2));
    console.log(`📄 Created ${filePath}`);
  }
}

async function load() {
  await ensureFile('users.json');
  await ensureFile('pokemon.json');

  const usersFile = await fs.readFile(path.join(config.dataDir, 'users.json'), 'utf-8');
  data.users = JSON.parse(usersFile);

  const pokemonFile = await fs.readFile(path.join(config.dataDir, 'pokemon.json'), 'utf-8');
  data.pokemon = JSON.parse(pokemonFile);

  console.log('✅ Data loaded successfully');
}

async function saveUsers() {
  await fs.writeFile(
    path.join(config.dataDir, 'users.json'),
    JSON.stringify(data.users, null, 2)
  );
}

async function savePokemon() {
  await fs.writeFile(
    path.join(config.dataDir, 'pokemon.json'),
    JSON.stringify(data.pokemon, null, 2)
  );
}

function getUser(userId) {
  if (!data.users.users[userId]) {
    data.users.users[userId] = {
      id: userId,
      pokemon: [],
      catches: 0,
    };
  }
  return data.users.users[userId];
}

function getPokemonList() {
  return data.pokemon.pokemon || [];
}

function getUsersData() {
  return data.users;
}

module.exports = { load, saveUsers, savePokemon, getUser, getPokemonList, getUsersData };
