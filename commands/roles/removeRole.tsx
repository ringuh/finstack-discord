module.exports = {
    name: ['removerole'],
    description: 'Removes role from user',
    args: "[user] <role>",
    execute(message, args) {
        if (args.length < 1) {
            message.channel.send(`Usage: ${this.name[0]} ${this.args}`, { code: true })
            return true
        }

        let roleStr = args.join(" ")
        const { IsUser } = require('../../funcs/mentions')
        let member = message.member
        if (args.length > 1) {
            member = IsUser(args[0], message.guild)
            if (member) {
                args.shift()
                roleStr = args.join(" ")
            } else {
                member = message.member
            }
        }

        const role = message.guild.roles.find(role => role.name.toLowerCase() == roleStr.toLowerCase())
        if (!role || !member.roles.get(role.id)) {
            message.channel.send(`Role '${roleStr}' not found ${role ? `on ${member.user.username}` : ''}`, { code: true });
            return true
        }

        if (role.hasPermission("ADMINISTRATOR")) {
            message.channel.send(`Managing admin roles forbidden`, { code: true });
            return true
        }

        const { Role, Request } = require('../../models')
        Role.findOne({ where: { server: message.guild.id, role: role.id } })
            .then(deleteRole => {
                const roleAdmin = deleteRole ? message.member.roles.get(deleteRole.admin) : false

                if (member.id != message.author.id && !roleAdmin && !message.member.hasPermission("ADMINISTRATOR")) {
                    message.channel.send(`You don't have permission to do whatever you were doing`, { code: true });
                    return true
                }


                member.removeRole(role.id).then(() =>
                    message.channel.send(`Removing role '${role.name}' from ${member}`, { code: false }))

                // if you remove your role by yourself allow re-applying
                if (member.id == message.author.id)
                    Request.destroy({
                        where:
                        {
                            server: message.guild.id,
                            role: role.id,
                            user: member.user.id
                        }
                    })

            })
    },
};