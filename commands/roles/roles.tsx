
export default {
	name: ['roles'],
	description: 'Lists all roles',
	args: false,
	execute(message, args) {

		const { Role } = require("../../models")
		Role.findAll({ where: { server: message.guild.id } })
			.then(roles => {
				let str = [`Available roles:`]
				roles.map(role => {
					const tmp = message.guild.roles.get(role.role)

					if (tmp) {
						const rl = message.guild.roles.get(role.admin)
						str.push(`${tmp.name} ${role.admin ? `(moderated by ${rl.name})` : ''}`)

					}
				});
				str.push('', "Request role by:", "!requestrole <role>")
				message.channel.send(str.join("\n"), { code: true });
			})
			.catch((err) => {
				console.log(err.message)
				throw err
			})
	},
};