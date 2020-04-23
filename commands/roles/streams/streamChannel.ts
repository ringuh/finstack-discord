import { Message } from "discord.js";
import { Setting } from "../../../models/settings";
import { StripMentions } from "../../../funcs/mentions";
import { isAdmin, usageMessage } from "../../../funcs/commandTools";
import { config } from "../../../models";
import { SettingKey } from "../../../models/enums/settingKey.enum";

export default {
    name: ['streamchannel'],
    description: 'Sets or resets default stream channel (admin)',
    args: "<#channel | reset>",
    async execute(message: Message, args: string[]) {
        if (!isAdmin(message, true)) return false
        const setting = await Setting.findOne({ server: message.guild.id, key: SettingKey.stream_channel })
        const [text, users, channels, roles] = StripMentions(args, message.guild);
        
        if (text && text !== 'reset')
            return message.channel.send(`Command failed. Invalid argument. Valid commands are #channel and 'reset'`, { code: true }).then(msg => msg.expire(message))

        if (text === 'reset') {
            if (setting) return await setting.remove().then(removed =>
                message.channel.send(`Default stream channel has been removed`, { code: true })
                    .then(msg => msg.expire(msg))).catch(err => message.channel.send(`Error: ${err.message}`, { code: true }));
            else message.channel.send(`Default stream channel hasn't been set yet\nuse: ${config.prefix}streamchannel #channel`, { code: true }).then(msg => msg.expire(message));
        } else if (channels.length) {
            if (setting) await setting.updateOne({ value: channels[0].id })
            else await Setting.create({ server: message.guild.id, key: SettingKey.stream_channel, value: channels[0].id })
            message.channel.send(`Default stream channel set to #${channels[0].name}`, { code: true }).then(msg => msg.expire(message)); 
        } else {
            const channel = message.guild.channels.cache.get(setting?.value.toString());
            if (!channel) message.channel.send(`Default stream channel hasn't been set yet\nuse: ${config.prefix}streamchannel #channel`, { code: true }).then(msg => msg.expire(message));
            else message.channel.send(`Default stream channel is #${channel.name}`, { code: true }).then(msg => msg.expire(message));
        }
    }
};



