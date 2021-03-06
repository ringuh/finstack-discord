import { config, twitchClient } from "../models";
import { Client, Message } from "discord.js";
import { StreamPlatform } from "../models/enums/streamPlatform.enum";
import { Streamer } from "../models/stream";
import { Guild } from "discord.js";
import { TextChannel } from "discord.js";
import { SettingKey } from "../models/enums/settingKey.enum";
import { Setting } from "../models/settings";
import { asTextChannel, printTimeDiff } from "./factories";
import { MessageEmbed } from "discord.js";
import { HelixStream, HelixUser } from "twitch";
import datetimeDifference from "datetime-difference";

interface defaultChannel {
    server: Guild,
    channel: TextChannel,
    name: string,
    streamCount: number,
}

async function twitchStreams(client: Client) {
    const streamers = await Streamer.find({ platform: StreamPlatform.twitch });
    if (!streamers.length) return false;
    const twitchUsers = await twitchClient.helix.users.getUsersByNames(streamers.map(streamer => streamer.name));

    const defaultSettings = await Setting.find({ key: SettingKey.stream_channel });
    const defaultChannels = {}
    
    defaultSettings.forEach(async setting => {
        const guild = client.guilds.resolve(setting.server.toString());
        if(!guild) return await setting.remove();
        const channel = guild.channels.cache.get(setting.value.toString())
        if(!channel) return await setting.remove();
        defaultChannels[channel.id] = {
            server: guild,
            channel: channel,
            name: setting.valueB,
            streamCount: 0
        }
    });
    
    for (let i in twitchUsers) {
        const twitchUser = twitchUsers[i];
        const streamerEntities = streamers.filter(streamer => streamer.name === twitchUser.name.toLowerCase());
        const userStream = await twitchUser.getStream();
        for (let j in streamerEntities) {
            const streamer = streamerEntities[j];
            const discordServer = client.guilds.resolve(streamer.server);
            if (!discordServer) {
                await streamer.remove();
                continue;
            }

            const setting = await Setting.findOne({ server: streamer.server, key: SettingKey.stream_channel });
            let channel: TextChannel;

            if (streamer.channel) {
                channel = asTextChannel(discordServer.channels.cache.get(streamer.channel));
                if (!channel) await streamer.updateOne({ channel: null, lastMessageId: null })
            }
            if (!channel) { 
                channel = asTextChannel(discordServer.channels.cache.get(setting.value.toString())); 
                if (!channel) continue;

                //defaultChannels[channel.id] = defaultChannels[channel.id] || { channel: channel, name: setting.valueB, streamCount: 0 }
                if(userStream) defaultChannels[channel.id].streamCount++;
            }
            

            if (streamer.lastMessageId && !userStream) {
                await channel.messages.fetch(streamer.lastMessageId).then(msg => msg.delete()).catch(err => console.log("fetch failed?", err.message))
                await streamer.updateOne({ lastMessageId: null });
            }

            if (!userStream) continue;

            const existingMessage = channel.messages.cache.get(streamer.lastMessageId)
            const embedMessage = twitchMessage(twitchUser, userStream);

            if (existingMessage)
                await existingMessage.edit(embedMessage).then(async msg => await streamer.updateOne({ lastSeen: new Date() })).catch(err => console.log(err.message));
            else await channel.send(embedMessage).then(async msg => await streamer.updateOne({ lastMessageId: msg.id, lastSeen: new Date() })).catch(err => console.log(err));
        }
    }
    
    renameChannels(defaultChannels);    
}

function renameChannels(defaultChannels) {
    Object.keys(defaultChannels).map(async key => {
        const channel = defaultChannels[key];
        const channelName = channel.streamCount ? `${channel.name}-${channel.streamCount}`: channel.name;
        if(channel.channel.name === channelName) return null;
        await channel.channel.edit({ name: channelName }).catch(console.error);
    })
}

function twitchMessage(user: HelixUser, stream: HelixStream): MessageEmbed {
    const timeDiff = datetimeDifference(new Date(stream.startDate), new Date())

    const emb = new MessageEmbed()
        .setTitle(stream.title)
        .setURL(`https://www.twitch.tv/${user.name}`)
        .setAuthor(user.name, user.profilePictureUrl, `https://www.twitch.tv/${user.name}`)
        .setImage(randomizeThumbnail(stream.thumbnailUrl))
        .setDescription(`Viewers: ${stream.viewers}`)
        .setTimestamp()
        .setFooter(`Streamed for ${printTimeDiff(timeDiff)}`);

    return emb
}

function randomizeThumbnail(thumbnail_url: string): string {
    const rndInt = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    let width = rndInt(1000, 1400)
    let thumbnail = thumbnail_url.replace("{width}", width.toString()).replace("{height}", Math.floor(width / (16 / 9)).toString())
    thumbnail = `${thumbnail}?time=${Date.now()}`

    return thumbnail
}

export function initStreams(client: Client) {
    twitchStreams(client);

    setInterval(() => twitchStreams(client), config.twitch_interval)
}
