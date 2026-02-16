# Pokemon Burple & Slate 🎮

A Discord bot for Pokemon with an integrated admin panel! Catch Pokemon as they appear at random intervals, manage your collection, and control everything through a beautiful web interface.

## Features

### Discord Bot
- 🎯 **Pokemon Catching**: Pokemon spawn randomly in channels
- 📊 **Collection Management**: Track all your caught Pokemon
- 🎲 **Random Spawns**: Pokemon appear at configurable random intervals
- 🔘 **Button Interactions**: Easy one-click catching with Discord buttons
- 🎨 **Rich Embeds**: Beautiful color-coded messages using the Burple theme

### Admin Panel
- 💻 **Code Execution**: Run JavaScript code in the bot's global context
- 📊 **Live Statistics**: Real-time bot stats and user information
- 🛠️ **Utilities**: Spawn Pokemon, view users, manage data
- 🎨 **Beautiful UI**: Sleek interface with Burple, Pink, and Green color scheme
- 🔐 **Secure Authentication**: Password-protected admin access

## Installation

1. Clone the repository:
```bash
git clone https://github.com/coderkearns/pokemon-burple-and-slate.git
cd pokemon-burple-and-slate
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme
POKEMON_SPAWN_MIN_INTERVAL=300000
POKEMON_SPAWN_MAX_INTERVAL=900000
```

5. Start the bot:
```bash
npm start
```

## Discord Bot Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Copy the bot token and add it to your `.env` file
5. Enable the following Privileged Gateway Intents:
   - MESSAGE CONTENT INTENT
6. Go to OAuth2 > URL Generator
7. Select scopes: `bot`
8. Select bot permissions: `Send Messages`, `Read Messages/View Channels`, `Read Message History`, `Add Reactions`
9. Use the generated URL to invite the bot to your server

## Usage

### Discord Commands

- `!pokemon` or `!collection` - View your Pokemon collection
- `!help` - Show help message
- `!spawn` - Spawn a Pokemon manually (Admin only)

### Catching Pokemon

When a Pokemon appears in a channel, click the "🎯 Catch!" button to catch it. The Pokemon will be added to your collection!

### Admin Panel

1. Open your browser to `http://localhost:3000` (or your configured PORT)
2. Login with your admin credentials from the `.env` file
3. Use the admin panel to:
   - View live statistics
   - Execute JavaScript code
   - Spawn Pokemon in specific channels
   - View user data
   - Manage the bot

## Data Storage

The bot uses JSON files for data storage:

- `data/pokemon.json` - Pokemon data (name, type, rarity, sprite)
- `data/users.json` - User data (caught Pokemon, statistics)

## Color Scheme

The project uses a beautiful color scheme:

- **Burple**: #5865f2 (Primary Discord color)
- **Green**: #35ed7e (Success states)
- **Pink**: #ff4cd2 (Accents)
- **Dark**: #1f1f1f (Backgrounds)
- **White**: #ffffff (Text)

## Development

To run in development mode:
```bash
npm run dev
```

## Security Note

⚠️ The admin panel allows code execution. Make sure to:
- Use strong credentials in your `.env` file
- Never expose your admin credentials
- Only allow trusted users to access the admin panel
- Consider adding additional security measures in production

## License

See LICENSE file for details. 
