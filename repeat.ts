import { config } from './models';
import { Client } from 'discord.js';
import './extensions/message.extension'

// pm2 start ts-node --name repeat -- -P tsconfig.json ./repeat.ts
const client = new Client();


client.on('message', message => {
    const command = `${config.prefix}repeat`
	if (!message.content.startsWith(command) || message.author.bot || !message.member.hasPermission("ADMINISTRATOR")) return;
    const str = message.content.slice(command.length).trim()
    
	try {
		message.channel.send(str)
	} catch (error) {
		console.error(error);
		message.reply(`Error occured: ${error.message}`);
	}
});


client.once('ready', async () => {
    console.log('Repeat bot running!');
});

client.login(config.repeat_token).catch(err => console.log(err.message));