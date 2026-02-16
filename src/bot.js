const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('./config');
const db = require('./db');
const { getRandomPokemon } = require('./pokemon');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const currentSpawns = new Map(); // channelId -> spawn info

// --- Spawn logic ---

async function spawnPokemon(channel) {
  const pokemon = getRandomPokemon();
  if (!pokemon) return;

  const typeDisplay = pokemon.types ? pokemon.types.join(', ') : (pokemon.type || 'Unknown');

  const embed = new EmbedBuilder()
    .setColor('#5865f2')
    .setTitle('A wild Pokemon appeared!')
    .setDescription(
      `${pokemon.sprite} **${pokemon.name}** appeared!\nType: ${typeDisplay}\nRarity: ${pokemon.rarity}`
    )
    .setFooter({ text: 'Click the button below to catch it!' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
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
      spawnTime: Date.now(),
    });

    setTimeout(() => {
      if (currentSpawns.has(channel.id)) {
        currentSpawns.delete(channel.id);
        message.edit({ components: [] }).catch(() => {});
      }
    }, config.spawnTimeout);
  } catch (error) {
    console.error('Error spawning Pokemon:', error);
  }
}

// --- Spawn scheduling ---

function scheduleSpawns() {
  function scheduleNext() {
    const interval =
      Math.random() * (config.spawnMaxInterval - config.spawnMinInterval) + config.spawnMinInterval;

    setTimeout(async () => {
      const channels = client.channels.cache.filter(
        ch => ch.isTextBased() && ch.guild && ch.permissionsFor(client.user)?.has('SendMessages')
      );

      if (channels.size > 0) {
        await spawnPokemon(channels.random());
      }

      scheduleNext();
    }, interval);
  }

  scheduleNext();
}

// --- Events ---

client.once('ready', async () => {
  console.log(`✅ Discord bot logged in as ${client.user.tag}`);
  scheduleSpawns();

  // Spawn immediately in a random channel after a short delay
  setTimeout(async () => {
    const channels = client.channels.cache.filter(
      ch => ch.isTextBased() && ch.guild && ch.permissionsFor(client.user)?.has('SendMessages')
    );
    if (channels.size > 0) {
      await spawnPokemon(channels.random());
    }
  }, 5000);
});

// Button interactions (catch)
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith('catch_')) {
    const pokemonId = parseInt(interaction.customId.split('_')[1], 10);
    const channelSpawn = currentSpawns.get(interaction.channelId);

    if (!channelSpawn || channelSpawn.pokemon.id !== pokemonId) {
      await interaction.reply({ content: '❌ This Pokemon is no longer available!', ephemeral: true });
      return;
    }

    const user = db.getUser(interaction.user.id);
    user.pokemon.push({
      ...channelSpawn.pokemon,
      caughtAt: new Date().toISOString(),
    });
    user.catches++;

    await db.saveUsers();
    currentSpawns.delete(interaction.channelId);

    const successEmbed = new EmbedBuilder()
      .setColor('#35ed7e')
      .setTitle('✅ Pokemon Caught!')
      .setDescription(
        `${interaction.user} caught ${channelSpawn.pokemon.sprite} **${channelSpawn.pokemon.name}**!\n\nTotal catches: ${user.catches}`
      )
      .setTimestamp();

    await interaction.update({ embeds: [successEmbed], components: [] });
  }
});

// Message commands
client.on('messageCreate', async message => {
  // Lazy-require to avoid circular dependency at module load time
  const commands = require('./commands/index');
  await commands.handle(message);
});

async function login() {
  try {
    await client.login(config.discordToken);
  } catch (error) {
    console.error('⚠️  Discord bot failed to connect:', error.message);
    console.log('💡 Web server is still running on http://localhost:' + config.port);
  }
}

module.exports = { client, currentSpawns, spawnPokemon, login };
