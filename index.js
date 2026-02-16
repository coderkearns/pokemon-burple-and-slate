require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Data storage
let pokemonData = null;
let usersData = null;
let currentSpawns = new Map(); // channelId -> spawn info

// Load data
async function loadData() {
  try {
    const pokemonFile = await fs.readFile('./data/pokemon.json', 'utf-8');
    pokemonData = JSON.parse(pokemonFile);
    
    const usersFile = await fs.readFile('./data/users.json', 'utf-8');
    usersData = JSON.parse(usersFile);
    
    console.log('✅ Data loaded successfully');
  } catch (error) {
    console.error('Error loading data:', error);
    process.exit(1);
  }
}

// Save users data
async function saveUsers() {
  try {
    await fs.writeFile('./data/users.json', JSON.stringify(usersData, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

// Get or create user
function getUser(userId) {
  if (!usersData.users[userId]) {
    usersData.users[userId] = {
      id: userId,
      pokemon: [],
      catches: 0,
    };
  }
  return usersData.users[userId];
}

// Get random Pokemon
function getRandomPokemon() {
  const allPokemon = pokemonData.pokemon;
  const rarityWeights = {
    common: 50,
    uncommon: 30,
    rare: 15,
    legendary: 5
  };
  
  const weightedPokemon = [];
  allPokemon.forEach(pokemon => {
    const weight = rarityWeights[pokemon.rarity] || 10;
    for (let i = 0; i < weight; i++) {
      weightedPokemon.push(pokemon);
    }
  });
  
  return weightedPokemon[Math.floor(Math.random() * weightedPokemon.length)];
}

// Spawn Pokemon in a channel
async function spawnPokemon(channel) {
  const pokemon = getRandomPokemon();
  
  const embed = new EmbedBuilder()
    .setColor('#5865f2')
    .setTitle('A wild Pokemon appeared!')
    .setDescription(`${pokemon.sprite} **${pokemon.name}** appeared!\nType: ${pokemon.type}\nRarity: ${pokemon.rarity}`)
    .setFooter({ text: 'Click the button below to catch it!' })
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`catch_${pokemon.id}`)
        .setLabel('🎯 Catch!')
        .setStyle(ButtonStyle.Primary)
    );

  try {
    const message = await channel.send({ embeds: [embed], components: [row] });
    currentSpawns.set(channel.id, {
      pokemon,
      messageId: message.id,
      spawnTime: Date.now()
    });
    
    // Remove spawn after 5 minutes
    setTimeout(() => {
      if (currentSpawns.has(channel.id)) {
        currentSpawns.delete(channel.id);
        message.edit({ components: [] }).catch(() => {});
      }
    }, 300000);
  } catch (error) {
    console.error('Error spawning Pokemon:', error);
  }
}

// Schedule random Pokemon spawns
function scheduleSpawns() {
  const minInterval = parseInt(process.env.POKEMON_SPAWN_MIN_INTERVAL) || 300000; // 5 minutes
  const maxInterval = parseInt(process.env.POKEMON_SPAWN_MAX_INTERVAL) || 900000; // 15 minutes
  
  function scheduleNext() {
    const interval = Math.random() * (maxInterval - minInterval) + minInterval;
    
    setTimeout(async () => {
      // Get all text channels the bot can see
      const channels = client.channels.cache.filter(
        channel => channel.isTextBased() && channel.guild && 
        channel.permissionsFor(client.user).has('SendMessages')
      );
      
      if (channels.size > 0) {
        const randomChannel = channels.random();
        await spawnPokemon(randomChannel);
      }
      
      scheduleNext();
    }, interval);
  }
  
  scheduleNext();
}

// Discord bot ready event
client.once('ready', async () => {
  console.log(`✅ Discord bot logged in as ${client.user.tag}`);
  
  // Start spawning Pokemon
  scheduleSpawns();
  
  // Spawn immediately in a random channel
  setTimeout(async () => {
    const channels = client.channels.cache.filter(
      channel => channel.isTextBased() && channel.guild && 
      channel.permissionsFor(client.user).has('SendMessages')
    );
    
    if (channels.size > 0) {
      const randomChannel = channels.random();
      await spawnPokemon(randomChannel);
    }
  }, 5000);
});

// Handle button interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  
  if (interaction.customId.startsWith('catch_')) {
    const pokemonId = parseInt(interaction.customId.split('_')[1]);
    const channelSpawn = currentSpawns.get(interaction.channelId);
    
    if (!channelSpawn || channelSpawn.pokemon.id !== pokemonId) {
      await interaction.reply({ content: '❌ This Pokemon is no longer available!', ephemeral: true });
      return;
    }
    
    const user = getUser(interaction.user.id);
    user.pokemon.push({
      ...channelSpawn.pokemon,
      caughtAt: new Date().toISOString()
    });
    user.catches++;
    
    await saveUsers();
    currentSpawns.delete(interaction.channelId);
    
    const successEmbed = new EmbedBuilder()
      .setColor('#35ed7e')
      .setTitle('✅ Pokemon Caught!')
      .setDescription(`${interaction.user} caught ${channelSpawn.pokemon.sprite} **${channelSpawn.pokemon.name}**!\n\nTotal catches: ${user.catches}`)
      .setTimestamp();
    
    await interaction.update({ embeds: [successEmbed], components: [] });
  }
});

// Handle commands
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  
  const prefix = '!';
  if (!message.content.startsWith(prefix)) return;
  
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  
  if (command === 'pokemon' || command === 'collection') {
    const user = getUser(message.author.id);
    
    if (user.pokemon.length === 0) {
      const embed = new EmbedBuilder()
        .setColor('#ff4cd2')
        .setTitle('Your Pokemon Collection')
        .setDescription('You haven\'t caught any Pokemon yet! Wait for one to appear and catch it!')
        .setFooter({ text: `Total catches: 0` });
      
      return message.reply({ embeds: [embed] });
    }
    
    const pokemonCounts = {};
    user.pokemon.forEach(p => {
      pokemonCounts[p.name] = (pokemonCounts[p.name] || 0) + 1;
    });
    
    const collectionText = Object.entries(pokemonCounts)
      .map(([name, count]) => {
        const pokemon = pokemonData.pokemon.find(p => p.name === name);
        return `${pokemon.sprite} **${name}** x${count}`;
      })
      .join('\n');
    
    const embed = new EmbedBuilder()
      .setColor('#5865f2')
      .setTitle('Your Pokemon Collection')
      .setDescription(collectionText)
      .setFooter({ text: `Total catches: ${user.catches}` });
    
    message.reply({ embeds: [embed] });
  }
  
  if (command === 'spawn' && message.member.permissions.has('Administrator')) {
    await spawnPokemon(message.channel);
    message.react('✅').catch(() => {});
  }
  
  if (command === 'help') {
    const embed = new EmbedBuilder()
      .setColor('#5865f2')
      .setTitle('Pokemon Bot Commands')
      .setDescription('Catch Pokemon as they appear in channels!')
      .addFields(
        { name: '!pokemon', value: 'View your Pokemon collection', inline: true },
        { name: '!collection', value: 'Same as !pokemon', inline: true },
        { name: '!help', value: 'Show this help message', inline: true },
        { name: '!spawn', value: 'Spawn a Pokemon (Admin only)', inline: true }
      )
      .setFooter({ text: 'Pokemon appear randomly in channels!' });
    
    message.reply({ embeds: [embed] });
  }
});

// Express routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Get bot stats
app.get('/api/stats', (req, res) => {
  const totalUsers = Object.keys(usersData.users).length;
  const totalCatches = Object.values(usersData.users).reduce((sum, user) => sum + user.catches, 0);
  const activeSpawns = currentSpawns.size;
  
  res.json({
    totalUsers,
    totalCatches,
    activeSpawns,
    botStatus: client.isReady() ? 'online' : 'offline',
    guilds: client.guilds.cache.size,
    channels: client.channels.cache.size
  });
});

// API: Get all users
app.get('/api/users', (req, res) => {
  res.json(usersData);
});

// API: Execute code (admin only)
app.post('/api/execute', (req, res) => {
  const { username, password, code } = req.body;
  
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Create context with utilities
    const context = {
      client,
      usersData,
      pokemonData,
      currentSpawns,
      saveUsers,
      spawnPokemon,
      console: {
        log: (...args) => {
          return args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
        }
      }
    };
    
    // Execute code
    const func = new Function(...Object.keys(context), `return (async () => { ${code} })()`);
    const result = func(...Object.values(context));
    
    // Handle promises
    if (result instanceof Promise) {
      result
        .then(output => res.json({ success: true, output: String(output || 'Code executed successfully') }))
        .catch(error => res.json({ success: false, error: error.message }));
    } else {
      res.json({ success: true, output: String(result || 'Code executed successfully') });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// API: Spawn Pokemon in a specific channel
app.post('/api/spawn', async (req, res) => {
  const { username, password, channelId } = req.body;
  
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
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

// Start the application
async function start() {
  await loadData();
  
  // Start Express server
  app.listen(PORT, () => {
    console.log(`✅ Web server running on http://localhost:${PORT}`);
  });
  
  // Start Discord bot
  client.login(process.env.DISCORD_TOKEN);
}

start().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
