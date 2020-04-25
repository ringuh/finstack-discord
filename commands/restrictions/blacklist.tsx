import { Message } from "discord.js";
import { Collection } from "discord.js";
import { StripMentions } from "../../funcs/mentions";
import fs from 'fs';
import path from 'path';
import { getCommands } from "../../funcs/commandRestrictions";
const { isAdmin, usageMessage } = require('../funcs/commandTools')

enum BlacklistTypes {
    reset = "reset",
    alert = "alert",
    server = "server"
}

export default {
    name: ['blacklist'],
    description: 'Blacklists this channel or multiple channels (admin)',
    args: `[command] [#channel1...#channelN] [${Object.keys(BlacklistTypes).map(key => `'${key}'`).join(" / ")}]`,
    permissions: ["MANAGE_MESSAGES"],
    async execute(message: Message, args: string[], params: string[]) {
        if (!isAdmin(message, true)) return false
        if (args.length < 1) return usageMessage(message, this)
        const commands = getCommands();
        const lastArg = BlacklistTypes[args.last().toLowerCase()];
        if(lastArg) args.splice(-1);

        const [text, users, channels, roles] = StripMentions(args, message.guild);

        if(text)

        if (text === '') true
    }
};





