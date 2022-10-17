// Require the necessary discord.js classes
import { Client, GatewayIntentBits } from 'discord.js';

// Create a new client instance
export const DiscordClient = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
DiscordClient.once('ready', () => {
  console.info('Discord service enabled!');
});

// Login to Discord with your client's token
DiscordClient.login(process.env.DISCORD_BOT_TOKEN);
