const { EmbedBuilder } = require('discord.js');
const { register } = require('./index');
const db = require('../db');

register('stats', {
  description: 'View your trainer stats',
  aliases: ['profile'],
  execute: async (message) => {
    const user = db.getUser(message.author.id);

    const totalPokemon = user.pokemon.length;
    const uniquePokemon = new Set(user.pokemon.map(p => p.name)).size;
    const highestLevel = user.pokemon.reduce((max, p) => {
      const lvl = p.training ? p.training.level : 1;
      return lvl > max ? lvl : max;
    }, 0);

    const rarityCounts = { common: 0, uncommon: 0, rare: 0, legendary: 0 };
    user.pokemon.forEach(p => { rarityCounts[p.rarity] = (rarityCounts[p.rarity] || 0) + 1; });

    const embed = new EmbedBuilder()
      .setColor('#5865f2')
      .setTitle(`📊 Trainer Stats: ${message.author.username}`)
      .addFields(
        { name: 'Total Catches', value: `${user.catches}`, inline: true },
        { name: 'Total Pokemon', value: `${totalPokemon}`, inline: true },
        { name: 'Unique Pokemon', value: `${uniquePokemon}`, inline: true },
        { name: 'Highest Level', value: `${highestLevel || 'N/A'}`, inline: true },
        { name: 'Common', value: `${rarityCounts.common}`, inline: true },
        { name: 'Uncommon', value: `${rarityCounts.uncommon}`, inline: true },
        { name: 'Rare', value: `${rarityCounts.rare}`, inline: true },
        { name: 'Legendary', value: `${rarityCounts.legendary}`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
});
