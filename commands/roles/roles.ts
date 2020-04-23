import { ServerRole, config } from "../../models";
import { Message } from "discord.js";

export default {
	name: ['roles'],
	description: 'Lists all roles',
	args: false,
	async execute(message: Message, args: string[]) {

		const serverRoles = await ServerRole.find({ server: message.guild.id });

		const text = ['Available roles:', "----------------", '']
		serverRoles.map(async serverRole => {
			const role = message.guild.roles.cache.get(serverRole.role);
			const channel = message.guild.channels.cache.get(serverRole.channel);
			const adminRole = message.guild.roles.cache.get(serverRole.admin);
			if (!role) {
				await serverRole.remove();
				return text.push(`role ${role.id} has been removed from server`)
			}

			if (adminRole)
				return text.push(`'${role.name}' (managed by '${adminRole.name}' at #${channel?.name})`)
			return text.push(`'${role.name}'`)
		});
		
		if (!serverRoles.length) text.push(`no roles found.`, `enable roles to request with ${config.prefix}managerole`)
		text.push(``, 'usage:',
			`${config.prefix}requestrole availableRole`,
			`${config.prefix}requestrole availableRoleRequiringApproval | message with the request`,
		);
		message.channel.send(text.join("\n"), { code: true }).then(msg => msg.bin(message));
	},
};