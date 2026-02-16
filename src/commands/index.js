const config = require('../config');

const commands = new Map();

function register(name, opts) {
  commands.set(name, opts);
  if (opts.aliases) {
    opts.aliases.forEach(alias => commands.set(alias, { ...opts, isAlias: true }));
  }
}

async function handle(message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const name = args.shift().toLowerCase();

  const cmd = commands.get(name);
  if (!cmd) return;

  if (cmd.adminOnly && !message.member.permissions.has('Administrator')) {
    return message.reply('❌ You need Administrator permissions to use this command.');
  }

  try {
    await cmd.execute(message, args);
  } catch (error) {
    console.error(`Error executing command "${name}":`, error);
    message.reply('❌ An error occurred while running that command.').catch(() => {});
  }
}

function getAll() {
  const unique = new Map();
  for (const [name, cmd] of commands) {
    if (!cmd.isAlias) unique.set(name, cmd);
  }
  return unique;
}

// Load all command files
require('./pokemon');
require('./train');
require('./pokedex');
require('./stats');
require('./spawn');
require('./help');

module.exports = { register, handle, getAll };
