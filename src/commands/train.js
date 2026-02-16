const { EmbedBuilder } = require('discord.js');
const { register } = require('./index');
const db = require('../db');

const TRAIN_COOLDOWN = 60000; // 1 minute
const trainCooldowns = new Map();

register('train', {
  description: 'Train one of your Pokemon to increase its stats',
  execute: async (message, args) => {
    const user = db.getUser(message.author.id);

    if (user.pokemon.length === 0) {
      return message.reply("❌ You don't have any Pokemon to train! Catch some first.");
    }

    // Check cooldown
    const lastTrain = trainCooldowns.get(message.author.id);
    if (lastTrain && Date.now() - lastTrain < TRAIN_COOLDOWN) {
      const remaining = Math.ceil((TRAIN_COOLDOWN - (Date.now() - lastTrain)) / 1000);
      return message.reply(`⏳ Your Pokemon need to rest! Try again in ${remaining}s.`);
    }

    // Select pokemon by name or index
    let pokemon;
    if (args.length > 0) {
      const query = args.join(' ').toLowerCase();
      // Try by index first
      const idx = parseInt(query, 10);
      if (!isNaN(idx) && idx >= 1 && idx <= user.pokemon.length) {
        pokemon = user.pokemon[idx - 1];
      } else {
        pokemon = user.pokemon.find(p => p.name.toLowerCase() === query);
      }
    } else {
      // Train a random pokemon
      pokemon = user.pokemon[Math.floor(Math.random() * user.pokemon.length)];
    }

    if (!pokemon) {
      return message.reply("❌ Couldn't find that Pokemon in your collection. Use `!pokemon` to see your collection.");
    }

    // Initialize training stats if needed
    if (!pokemon.training) {
      pokemon.training = { level: 1, xp: 0 };
    }

    // Gain XP
    const xpGain = Math.floor(Math.random() * 20) + 10;
    pokemon.training.xp += xpGain;

    // Level up check (100 XP per level)
    let leveledUp = false;
    while (pokemon.training.xp >= pokemon.training.level * 100) {
      pokemon.training.xp -= pokemon.training.level * 100;
      pokemon.training.level++;
      leveledUp = true;
    }

    trainCooldowns.set(message.author.id, Date.now());
    await db.saveUsers();

    const embed = new EmbedBuilder()
      .setColor(leveledUp ? '#35ed7e' : '#5865f2')
      .setTitle(`${pokemon.sprite} Training: ${pokemon.name}`)
      .setDescription(
        `Gained **${xpGain} XP**!` +
        (leveledUp ? `\n🎉 **Level Up!** Now level ${pokemon.training.level}!` : '') +
        `\n\nLevel: ${pokemon.training.level}` +
        `\nXP: ${pokemon.training.xp}/${pokemon.training.level * 100}`
      )
      .setFooter({ text: 'Train again in 1 minute' })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
});
