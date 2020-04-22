import { Message } from "discord.js";
import { isAdmin, usageMessage } from "../../funcs/commandTools";
import { StripMentions, IsChannel, IsRole } from "../../funcs/mentions";
import { ServerRole } from "../../models";


export default {
    name: ['managerole'],
    description: 'Toggles role requests (admin)',
    args: "<role> [channel] [officer_role]",
    async execute(message: Message, args: string[]) {
        if (!isAdmin(message, true)) return false;
        if (args.length < 1) return usageMessage(message, this);
        
        const [text, users, channels, roles] = StripMentions(args, message.guild);

        let [targetRole, adminRole, excess] = roles;
        let targetRoleArgs = [];
        let adminRoleArgs = [];
        let channel = channels.length ? channels[0] : null;

        if (!targetRole) {
            channel = null;
            args.map(arg => {
                if (arg.startsWith("<#")) channel = IsChannel(arg, message.guild);
                else if (!channel) targetRoleArgs.push(arg)
                else adminRoleArgs.push(arg)
            })

            targetRole = IsRole(`@${targetRoleArgs.join(" ")}`, message.guild);
            adminRole = IsRole(`@${adminRoleArgs.join(" ")}`, message.guild);
        }

        if (!adminRole) channel = null;

        if (!targetRole) return message.channel.send(`Role not found`, { code: true }).then(msg => msg.expire(message));
        if (targetRole.permissions.any("ADMINISTRATOR"))
            return message.channel.send(`Managing admin roles is forbidden`, { code: true }).then(msg => msg.expire(message));

        const serverRole = await ServerRole.findOneAndUpdate({
            server: message.guild.id,
            role: targetRole.id
        }, {
            channel: channel?.id,
            admin: adminRole?.id
        }, { lean: false });

        if (!serverRole) {
            let successText = `Enabled access to '${targetRole.name}'`;
            if (channel) successText = `${successText} at #${channel.name}`
            if (adminRole) successText = `${successText} managed by '${adminRole.name}'`
            ServerRole.create({
                server: message.guild.id,
                role: targetRole.id,
                channel: channel?.id,
                admin: adminRole?.id,
            }).then(role => message.channel.send(successText, { code: true }).then(msg => msg.bin(message)))
        } else {
            const removeText = `Removed access to '${targetRole.name}'.\nRun this command again if you were trying to modify the role.`
            await serverRole.remove().then(() => message.channel.send(removeText, { code: true }).then(msg => msg.bin(message)))

        }
    },
};