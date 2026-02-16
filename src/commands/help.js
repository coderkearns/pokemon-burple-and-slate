const { EmbedBuilder } = require('discord.js');
const { register, getAll } = require('./index');
const config = require('../config');

register('help', {
  description: 'Show all available commands',
  execute: async (message) => {
    const commands = getAll();

    const fields = [];
    for (const [name, cmd] of commands) {
      let value = cmd.description || 'No description';
      if (cmd.adminOnly) value += ' *(Admin)*';
      if (cmd.aliases) value += `\nAliases: ${cmd.aliases.map(a => `\`${config.prefix}${a}\``).join(', ')}`;
      fields.push({ name: `${config.prefix}${name}`, value, inline: true });
    }

    const embed = new EmbedBuilder()
      .setColor('#5865f2')
      .setTitle('Pokemon Bot Commands')
      .setDescription('Catch Pokemon as they appear in channels!')
      .addFields(fields)
      .setFooter({ text: 'Pokemon appear randomly in channels!' });

    message.reply({ embeds: [embed] });
  },
});
