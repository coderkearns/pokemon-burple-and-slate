# Pokemon Burple & Slate 🎮

A Discord bot for Pokemon with an integrated admin panel! Catch real Pokemon (Gen 1–4) as they appear at random intervals, train them, browse the Pokedex, and manage everything through a web interface.

## Features

### Discord Bot
- 🎯 **Pokemon Catching**: Real Pokemon (Gen 1–4, from PokeAPI) spawn randomly in channels
- 📊 **Collection Management**: Track all your caught Pokemon
- 🏋️ **Training**: Train your Pokemon to gain XP and level up
- 📖 **Pokedex**: Browse all available Pokemon with stats
- 📈 **Trainer Stats**: View your trainer profile and progress
- 🎲 **Random Spawns**: Pokemon appear at configurable random intervals
- 🔘 **Button Interactions**: Easy one-click catching with Discord buttons
- 🎨 **Rich Embeds**: Beautiful color-coded messages using the Burple theme

### Admin Panel
- 📊 **Live Statistics**: Real-time bot stats and user information
- 🛠️ **Utilities**: Spawn Pokemon, view users, manage data
- 🎨 **Beautiful UI**: Sleek interface with Burple, Pink, and Green color scheme
- 🔐 **Secure Authentication**: Password-protected admin access

## Project Structure

```
├── index.js                 # Entry point
├── src/
│   ├── config.js            # Centralized configuration
│   ├── db.js                # Data loading/saving with auto-creation
│   ├── pokemon.js           # Pokemon logic & PokeAPI integration
│   ├── bot.js               # Discord bot setup & event handlers
│   ├── server.js            # Express web server
│   └── commands/
│       ├── index.js          # Command handler/registry
│       ├── pokemon.js        # !pokemon / !collection
│       ├── train.js          # !train
│       ├── pokedex.js        # !pokedex / !dex
│       ├── stats.js          # !stats / !profile
│       ├── spawn.js          # !spawn (admin)
│       └── help.js           # !help
├── data/                    # Auto-created JSON data files
├── public/                  # Admin panel frontend
└── .env.example             # Environment variable template
```

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
BOT_PREFIX=!
POKEMON_SPAWN_MIN_INTERVAL=300000
POKEMON_SPAWN_MAX_INTERVAL=900000
POKEMON_SPAWN_TIMEOUT=300000
DATA_DIR=./data
MAX_POKEMON_ID=493
```

5. Start the bot:
```bash
npm start
```

On first launch the bot will:
- Create `data/users.json` and `data/pokemon.json` if they don't exist
- Fetch Pokemon #1–493 from [PokeAPI](https://pokeapi.co/) and cache them locally

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

| Command | Aliases | Description |
|---------|---------|-------------|
| `!pokemon` | `!collection` | View your Pokemon collection |
| `!train [name/index]` | | Train a Pokemon to gain XP and level up |
| `!pokedex [name/id]` | `!dex` | Browse all available Pokemon |
| `!stats` | `!profile` | View your trainer stats |
| `!help` | | Show all available commands |
| `!spawn` | | Spawn a Pokemon manually *(Admin only)* |

### Catching Pokemon

When a Pokemon appears in a channel, click the "🎯 Catch!" button to catch it. The Pokemon will be added to your collection!

### Admin Panel

1. Open your browser to `http://localhost:3000` (or your configured PORT)
2. Login with your admin credentials from the `.env` file
3. Use the admin panel to:
   - View live statistics
   - Spawn Pokemon in specific channels
   - View user data

## Data Storage

The bot uses JSON files for data storage (auto-created on first run):

- `data/pokemon.json` - Pokemon data fetched from PokeAPI (id, name, types, rarity, stats)
- `data/users.json` - User data (caught Pokemon, training progress, statistics)

## Configuration

All settings are controlled via environment variables (see `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `DISCORD_TOKEN` | | Discord bot token (required) |
| `PORT` | `3000` | Web server port |
| `BOT_PREFIX` | `!` | Command prefix |
| `POKEMON_SPAWN_MIN_INTERVAL` | `300000` | Min spawn interval (ms) |
| `POKEMON_SPAWN_MAX_INTERVAL` | `900000` | Max spawn interval (ms) |
| `POKEMON_SPAWN_TIMEOUT` | `300000` | How long a spawn stays (ms) |
| `MAX_POKEMON_ID` | `493` | Highest Pokemon ID to fetch (493 = Gen 4) |
| `DATA_DIR` | `./data` | Directory for JSON data files |

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

## Security Notes

- Use **strong, unique credentials** in your `.env` file
- **Never expose** your admin credentials
- Consider **IP whitelisting** in production environments
- Enable **HTTPS** when deploying to production
- Consider adding **rate limiting** (e.g., `express-rate-limit`)

## License

See LICENSE file for details. 
