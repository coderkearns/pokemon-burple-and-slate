const { EmbedBuilder } = require('discord.js');
const { register } = require('./index');
const db = require('../db');

register('pokemon', {
  description: 'View your Pokemon collection',
  aliases: ['collection'],
  execute: async (message) => {
    const user = db.getUser(message.author.id);

    if (user.pokemon.length === 0) {
      const embed = new EmbedBuilder()
        .setColor('#ff4cd2')
        .setTitle('Your Pokemon Collection')
        .setDescription("You haven't caught any Pokemon yet! Wait for one to appear and catch it!")
        .setFooter({ text: 'Total catches: 0' });
      return message.reply({ embeds: [embed] });
    }

    const pokemonCounts = {};
    user.pokemon.forEach(p => {
      pokemonCounts[p.name] = pokemonCounts[p.name] || { count: 0, sprite: p.sprite };
      pokemonCounts[p.name].count++;
    });

    const collectionText = Object.entries(pokemonCounts)
      .map(([name, { count, sprite }]) => `${sprite} **${name}** x${count}`)
      .join('\n');

    // Paginate if needed (Discord embed limit is 4096 chars)
    const lines = collectionText.split('\n');
    const pages = [];
    let current = '';
    for (const line of lines) {
      if ((current + '\n' + line).length > 4000) {
        pages.push(current);
        current = line;
      } else {
        current = current ? current + '\n' + line : line;
      }
    }
    if (current) pages.push(current);

    for (let i = 0; i < pages.length; i++) {
      const embed = new EmbedBuilder()
        .setColor('#5865f2')
        .setTitle(`Your Pokemon Collection${pages.length > 1 ? ` (${i + 1}/${pages.length})` : ''}`)
        .setDescription(pages[i])
        .setFooter({ text: `Total catches: ${user.catches}` });
      await message.reply({ embeds: [embed] });
    }
  },
});
