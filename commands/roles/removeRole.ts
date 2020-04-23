import { Message } from "discord.js";
import { usageMessage } from "../../funcs/commandTools";
import { StripMentions } from "../../funcs/mentions";
import { ServerRole } from "../../models";

export default {
    name: ['removerole'],
    description: 'Removes role from user',
    args: "[@user] <role>",
    permissions: ["MANAGE_ROLES"],
    async execute(message: Message, args: string[], parameters: string[]) {
        if (args.length < 1) return usageMessage(message, this)
        let [argText, users, channels, roles] = StripMentions(args, message.guild);

        if (!users.length) users[0] = message.member;
        
        if (!roles.length) roles = args.map(arg => message.guild.roles.cache.find(role => role.name.toLowerCase() === arg.toLowerCase())).filter(arg => arg)

        roles.forEach(async role => {
            if (role.permissions.has('ADMINISTRATOR'))
                return message.channel.send(`Managing admin roles is forbidden`, { code: true }).then(msg => msg.expire(message));
            const serverRole = await ServerRole.findOne({ server: message.guild.id, role: role.id });
            const admin = message.member.hasPermission("ADMINISTRATOR") || message.member.roles.cache.get(serverRole.admin);

            users.forEach(user => {
                const hasRole = user.roles.cache.get(role.id)
                if (!hasRole) return message.channel.send(`Role '${role.name}' not found on '${user.user.username}'`, { code: true }).then(msg => msg.expire(message));
                if (!admin && user.id !== message.member.id)
                    return message.channel.send(`Insufficient access to remove role '${role.name}' from '${user.user.username}'`, { code: true }).then(msg => msg.expire(message));

                if (user.id === message.member.id || admin )
                    user.roles.remove(role).then(success => message.channel.send(`Removed role '${role.name}' from '${user.user.username}'`, { code: true }).then(msg => msg.bin(message)));
            });
        });
    }
};