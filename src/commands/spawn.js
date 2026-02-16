const { register } = require('./index');
const { spawnPokemon } = require('../bot');

register('spawn', {
  description: 'Spawn a Pokemon in the current channel (Admin only)',
  adminOnly: true,
  execute: async (message) => {
    await spawnPokemon(message.channel);
    message.react('✅').catch(() => {});
  },
});
