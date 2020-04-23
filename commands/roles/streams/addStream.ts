import { Message } from "discord.js";
import { Setting } from "../../../models/settings";
import { StripMentions } from "../../../funcs/mentions";
import { isAdmin, usageMessage } from "../../../funcs/commandTools";
import { config, twitchClient } from "../../../models";
import { SettingKey } from "../../../models/enums/settingKey.enum";
import { Streamer } from "../../../models/stream";
import { StreamPlatform } from "../../../models/enums/streamPlatform.enum";



export default {
    name: ['addstream'],
    description: 'Adds a stream to be tracked (admin)',
    args: `<${Object.keys(StreamPlatform).join(" / ")}> <stream> [#channel]`,
    async execute(message: Message, args: string[]) {
        if (!isAdmin(message, true)) return false
        if (args.length < 2) return usageMessage(message, this);

        const setting = await Setting.findOne({ server: message.guild.id, key: SettingKey.stream_channel })
        if (!setting) return message.channel.send(`Default stream channel hasn't been set yet\nuse: ${config.prefix}streamchannel #channel`, { code: true }).then(msg => msg.expire(message));

        const platform = StreamPlatform[args[0].toLowerCase()];
        if (!platform) return message.channel.send(`Invalid streaming platform '${args[0]}'`, { code: true }).then(msg => msg.expire(message))

        args = args.slice(1)
        const [text, users, channels, roles] = StripMentions(args, message.guild);
        const channel = channels[0];
        const channelMsg = channel ? `to #${channel.name}` : '';

        text.split(" ").map(async name => {
            const streamName = name.toLowerCase()
            const streamer = await Streamer.findOne({ server: message.guild.id, platform: platform, name: streamName })
            if (streamer) return message.channel.send(`Stream '${streamer.name}' @ ${streamer.platform} already exists.`, { code: true }).then(msg => msg.expire(message))

            if (platform === StreamPlatform.twitch) {
                const twitchUser = await twitchClient.helix.users.getUserByName(streamName);
                if (!twitchUser) return message.channel.send(`Twitch doesn't have user '${streamName}'`, { code: true }).then(msg => msg.expire(message))
            }
            Streamer.create({ server: message.guild.id, platform: platform, name: streamName, channel: channel?.id }).then(addedStream =>
                message.channel.send(`Added stream '${addedStream.name}' @ ${addedStream.platform} ${channelMsg}`, { code: true }).then(msg => msg.bin(message)));
        });
    }
};



