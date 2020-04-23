import { Message } from "discord.js";
import { Streamer } from "../../../models/stream";
import { StreamPlatform } from "../../../models/enums/streamPlatform.enum";
import { Setting } from "../../../models/settings";
import { SettingKey } from "../../../models/enums/settingKey.enum";
import { config } from "../../../models";
import datetimeDifference from "datetime-difference";
import { printTimeDiff } from "../../../funcs/factories";

export default {
    name: ['streams'],
    description: 'Lists all streams',
    args: null,
    async execute(message: Message, args: string[]) {
        const setting = await Setting.findOne({ server: message.guild.id, key: SettingKey.stream_channel })
        const streamers = await Streamer.find({ server: message.guild.id });

        const defaultChannel = message.guild.channels.cache.get(setting?.value.toString());
        if (!defaultChannel) return message.channel.send(`Default stream channel not found.\nuse: ${config.prefix}streamchannel #channel`, { code: true }).then(msg => msg.expire(message));

        const text = ['Streams:', "----------------", '']
        streamers.map(async streamer => {
            const channel = message.guild.channels.cache.get(streamer.channel);

            if (streamer.channel && !channel) {
                await streamer.updateOne({ channel: null, lastMessageId: null });
            }
            const channelTxt = channel?.name || defaultChannel.name;
            const seenTxt = streamer.lastSeen ? printTimeDiff(datetimeDifference(new Date(streamer.lastSeen), new Date())) : 'never';            
            
            if (streamer.platform === StreamPlatform.twitch)
                return text.push(`twitch.tv/${streamer.name} |  #${channelTxt} | (seen: ${seenTxt})`)
            else return text.push(`not-implemented-platform/'${streamer.name} #${channelTxt} (seen: ${seenTxt})`)
        });

        if (!streamers.length) text.push(`no streams found.`, `add streams with ${config.prefix}addstream`)
        
        message.channel.send(text.join("\n"), { code: true }).then(msg => msg.bin(message));
    },
};