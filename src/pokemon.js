const fs = require('fs').promises;
const path = require('path');
const config = require('./config');
const db = require('./db');

const TYPE_EMOJIS = {
  normal: '⚪', fire: '🔥', water: '💧', grass: '🌿', electric: '⚡',
  ice: '❄️', fighting: '🥊', poison: '☠️', ground: '🌍', flying: '🦅',
  psychic: '🔮', bug: '🐛', rock: '🪨', ghost: '👻', dragon: '🐉',
  dark: '🌑', steel: '⚔️', fairy: '🌸',
};

const RARITY_WEIGHTS = {
  common: 50,
  uncommon: 30,
  rare: 15,
  legendary: 5,
};

function rarityFromBaseExp(baseExperience) {
  if (baseExperience >= 300) return 'legendary';
  if (baseExperience >= 200) return 'rare';
  if (baseExperience >= 100) return 'uncommon';
  return 'common';
}

/**
 * Fetch Pokemon from PokeAPI and populate the local database.
 * Fetches only if the local list is empty.
 */
async function fetchPokemonFromApi() {
  const current = db.getPokemonList();
  if (current.length > 0) {
    console.log(`📦 ${current.length} Pokemon already in local database, skipping fetch`);
    return;
  }

  console.log(`🌐 Fetching Pokemon #1-${config.maxPokemonId} from PokeAPI...`);

  const batchSize = 50;
  const allPokemon = [];

  for (let start = 1; start <= config.maxPokemonId; start += batchSize) {
    const end = Math.min(start + batchSize - 1, config.maxPokemonId);
    const promises = [];
    for (let id = start; id <= end; id++) {
      promises.push(
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
          .then(r => r.ok ? r.json() : null)
          .catch(err => {
            console.error(`  ⚠️ Failed to fetch Pokemon #${id}:`, err.message);
            return null;
          })
      );
    }

    const results = await Promise.all(promises);
    for (const p of results) {
      if (!p) continue;
      const types = p.types.map(t => t.type.name);
      allPokemon.push({
        id: p.id,
        name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
        types,
        rarity: rarityFromBaseExp(p.base_experience || 50),
        sprite: TYPE_EMOJIS[types[0]] || '❓',
        stats: {
          hp: p.stats.find(s => s.stat.name === 'hp')?.base_stat || 1,
          attack: p.stats.find(s => s.stat.name === 'attack')?.base_stat || 1,
          defense: p.stats.find(s => s.stat.name === 'defense')?.base_stat || 1,
          speed: p.stats.find(s => s.stat.name === 'speed')?.base_stat || 1,
        },
      });
    }

    console.log(`  ✅ Fetched ${allPokemon.length}/${config.maxPokemonId}`);
  }

  // Store to db file
  const pokemonData = { pokemon: allPokemon };
  await fs.writeFile(
    path.join(config.dataDir, 'pokemon.json'),
    JSON.stringify(pokemonData, null, 2)
  );

  // Reload so db cache is up to date
  await db.load();
  console.log(`🎉 Fetched and saved ${allPokemon.length} Pokemon`);
}

function getRandomPokemon() {
  const allPokemon = db.getPokemonList();
  const weightedPokemon = [];
  allPokemon.forEach(pokemon => {
    const weight = RARITY_WEIGHTS[pokemon.rarity] || 10;
    for (let i = 0; i < weight; i++) {
      weightedPokemon.push(pokemon);
    }
  });
  return weightedPokemon[Math.floor(Math.random() * weightedPokemon.length)];
}

module.exports = { fetchPokemonFromApi, getRandomPokemon, RARITY_WEIGHTS, TYPE_EMOJIS };
