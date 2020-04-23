import { Message } from "discord.js";
import { Setting } from "../../../models/settings";
import { StripMentions } from "../../../funcs/mentions";
import { isAdmin, usageMessage } from "../../../funcs/commandTools";
import { config } from "../../../models";
import { SettingKey } from "../../../models/enums/settingKey.enum";
import { Streamer } from "../../../models/stream";
import { StreamPlatform } from "../../../models/enums/streamPlatform.enum";



export default {
    name: ['removestream'],
    description: 'Removes a stream from list (admin)',
    args: `<${Object.keys(StreamPlatform).join(" / ")}> <stream>`,
    execute(message: Message, args: string[]) {
        if (!isAdmin(message, true)) return false
        if (args.length < 2) return usageMessage(message, this);
        
        if (!Object.keys(StreamPlatform).includes(args[0].toLowerCase()))
            return message.channel.send(`Invalid streaming site '${args[0]}'`, { code: true }).then(msg => msg.expire(message))

        const platform = StreamPlatform[args[0].toLowerCase()];
        Streamer.findOneAndDelete({
            server: message.guild.id, platform: platform, name: args[1].toLowerCase()
        }).then(deleted => message.channel.send(`Removed stream '${deleted.name}' @ ${platform}`, { code: true }).then(msg => msg.bin(message)))
            .catch(err => message.channel.send(`Removing stream failed:  ${err.message}`, { code: true }).then(msg => msg.expire(message)))
    }
};



