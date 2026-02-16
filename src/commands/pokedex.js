const { EmbedBuilder } = require('discord.js');
const { register } = require('./index');
const db = require('../db');

register('pokedex', {
  description: 'Browse all available Pokemon',
  aliases: ['dex'],
  execute: async (message, args) => {
    const allPokemon = db.getPokemonList();

    if (allPokemon.length === 0) {
      return message.reply('❌ The Pokedex is empty. Pokemon data has not been loaded yet.');
    }

    // If a name or ID is provided, show details for that Pokemon
    if (args.length > 0) {
      const query = args.join(' ').toLowerCase();
      const idx = parseInt(query, 10);
      const pokemon = !isNaN(idx)
        ? allPokemon.find(p => p.id === idx)
        : allPokemon.find(p => p.name.toLowerCase() === query);

      if (!pokemon) {
        return message.reply(`❌ Pokemon "${args.join(' ')}" not found in the Pokedex.`);
      }

      const embed = new EmbedBuilder()
        .setColor('#5865f2')
        .setTitle(`${pokemon.sprite} #${pokemon.id} ${pokemon.name}`)
        .addFields(
          { name: 'Types', value: pokemon.types ? pokemon.types.join(', ') : (pokemon.type || 'Unknown'), inline: true },
          { name: 'Rarity', value: pokemon.rarity, inline: true }
        )
        .setTimestamp();

      if (pokemon.stats) {
        embed.addFields(
          { name: 'HP', value: `${pokemon.stats.hp}`, inline: true },
          { name: 'Attack', value: `${pokemon.stats.attack}`, inline: true },
          { name: 'Defense', value: `${pokemon.stats.defense}`, inline: true },
          { name: 'Speed', value: `${pokemon.stats.speed}`, inline: true }
        );
      }

      return message.reply({ embeds: [embed] });
    }

    // Show summary: counts by rarity
    const counts = { common: 0, uncommon: 0, rare: 0, legendary: 0 };
    allPokemon.forEach(p => { counts[p.rarity] = (counts[p.rarity] || 0) + 1; });

    const embed = new EmbedBuilder()
      .setColor('#5865f2')
      .setTitle('📖 Pokedex')
      .setDescription(`Total Pokemon: **${allPokemon.length}**`)
      .addFields(
        { name: 'Common', value: `${counts.common}`, inline: true },
        { name: 'Uncommon', value: `${counts.uncommon}`, inline: true },
        { name: 'Rare', value: `${counts.rare}`, inline: true },
        { name: 'Legendary', value: `${counts.legendary}`, inline: true }
      )
      .setFooter({ text: `Use ${message.content.split(' ')[0]} <name or id> to view details` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
});
