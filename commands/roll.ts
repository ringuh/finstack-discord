import { isNumber } from "@typegoose/typegoose/lib/internal/utils";
import { Message } from "discord.js";
import { Collection } from "discord.js";

const { isAdmin, usageMessage } = require('../funcs/commandTools')

export default {
    name: ['roll'],
    description: 'Roll the dice',
    args: "[min] <max>",
    permissions: ["MANAGE_MESSAGES"],
    async execute(message: Message, args: string[]) {
        const argString = args.join(' ').replace(/-/g, " ").trim();
        const numbers = argString ? argString.split(' ').map(arg => {
            let nr = parseInt(arg) || 1;
            if (nr < 1) return 1
            else if (nr > 999999999) return 999999999
            return nr
        }) : [1, 100];

        let [min, max] = [numbers[0] || 1, numbers[1] || 100];

        if (numbers.length === 1) {
            max = min;
            min = 1;
        }

        if (min > max || max < min) {
            min = 1;
            max = 100;
        }
        const roll = Math.floor(Math.random() * (max - min)) + min

        let [prefix, type] = [' ', 'js'];
        const percentage = Math.floor((roll - min) / (max - min) * 100);
        if (percentage >= 90) {
            type = 'diff'
            prefix = '+'
        }
        else if (percentage > 65) type = 'fix'
        else if (percentage < 35) {
            type = 'diff'
            prefix = '-'
        }
        const rollText = `${prefix} ${message.author.username} rolled ${roll} (${min} - ${max})`
        message.channel.send(rollText, { code: type }).then(msg => message.expire());
    }
}

