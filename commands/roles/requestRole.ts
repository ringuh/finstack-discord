import { usageMessage } from "../../funcs/commandTools";
import { Message } from "discord.js";
import { StripMentions } from "../../funcs/mentions";
import { ServerRole, config } from "../../models";
import { MessageEmbed } from "discord.js";
import { TextChannel } from "discord.js";
import { Client } from "discord.js";
import { ClientUser } from "discord.js";
import { GuildMember } from "discord.js";
import { User } from "discord.js";

export default {
    name: ['requestrole'],
    description: 'Requests a role to user',
    args: "[@user] <role> [ | reason ]",
    permissions: ['MANAGE_ROLES'],
    async execute(message: Message, args: string[], parameters: string[]) {
        if (args.length < 1) return usageMessage(message, this)
        let [argText, users, channels, roles] = StripMentions(args, message.guild);

        if (argText) {
            const textRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === argText.toLowerCase());
            if (textRole) roles.push(textRole);
        }

        if (!roles.length) return message.channel.send(`Role '${argText}' not found`, { code: true }).then(msg => msg.expire(message));
        if (!users.length) users[0] = message.member;

        roles.forEach(async role => {
            if (role.permissions.has('ADMINISTRATOR'))
                return message.channel.send(`Managing admin roles is forbidden`, { code: true }).then(msg => msg.expire(message));
            const serverRole = await ServerRole.findOne({ server: message.guild.id, role: role.id })
            if (!serverRole) return message.channel.send(`Role '${role.name}' is not available for request`, { code: true }).then(msg => msg.expire(message));

            const admin = message.member.hasPermission("ADMINISTRATOR") || message.member.roles.cache.get(serverRole.admin);
            users.forEach(user => {
                if (!admin && user.id !== message.member.id)
                    return message.channel.send(`Insufficient access to add role '${role.name}' to '${user.user.username}'`, { code: true }).then(msg => msg.expire(message));

                if (user.roles.cache.get(role.id))
                    return message.channel.send(`'${user.user.username}' already has the role '${role.name}'`, { code: true }).then(msg => msg.expire(message));

                if (!serverRole.admin || admin)
                    user.roles.add(role).then(success => message.channel.send(`Added role '${role.name}' to '${user.user.username}'`, { code: true }).then(msg => msg.bin(message)));
                else {
                    const embeddedMessage = new MessageEmbed()
                        .setTitle(`Promote '${user.user.username}' as '${role.name}'`)
                        .setDescription(parameters?.join(" "))
                        .addField(`🆗 Accept`, "\u200B", false)
                        .addField(`🚷 Refuse`, "\u200B", false)
                        .setTimestamp()
                        .setFooter(`expires after 24h`);

                    message.reply(`request for role '${role.name}' sent. Wait for admins approval, it might take a while.`, { code: false }).then(msg => msg.expire(message));
                    const adminChannel = message.client.channels.resolve(serverRole.channel)

                    // @ts-ignore
                    adminChannel.send(embeddedMessage).then(async reactionMessage => {
                        await reactionMessage.react("🆗")
                        await reactionMessage.react("🚷")

                        const filter = (reaction: any, user: User) => {
                            if (user.id === reactionMessage.author.id) return false

                            const guildMember = message.guild.members.resolve(user)
                            return ['🆗', '🚷'].includes(reaction.emoji.name) && (
                                guildMember.hasPermission("ADMINISTRATOR") ||
                                config.bypass_list.includes(user.id) ||
                                guildMember.roles.cache.get(serverRole.admin)
                            )
                        };

                        reactionMessage.awaitReactions(filter, { max: 1, time: 24 * 60 * 60000, errors: ['time'] })
                            .then(async collected => {
                                const reaction = collected.first();
                                const handler = await reaction.users.fetch().then(users => users.find(user => user.id !== message.author.id));
                                console.log(handler)
                                if (reaction.emoji.name === '🆗') {
                                    user.roles.add(role).then(() => reactionMessage.channel.send(
                                        `${user.user.username} promoted to '${role.name}' by '${handler.username}'`
                                    ).then(msg => msg.bin(message)));

                                    reactionMessage.delete().catch(err => console.log(err.message));

                                } else if (reaction.emoji.name === '🚷') {
                                    reactionMessage.channel.send(`${user.user.username} request declined by ${handler.username}`).then(msg => msg.bin(message));
                                    message.reply(`request for role '${role.name}' declined`, { code: false }).then(msg => msg.bin(message));
                                    reactionMessage.delete().catch(err => console.log(err.message));
                                }
                            }).catch(err => console.log(err.message));
                    });
                }
            });
        });
    },
};