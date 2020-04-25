import path from "path";
import fs from 'fs';


function hasAccess(command: string, channel: string) {

}












const getCommands = () => {
    const commands = [];
    const loadCommands = (filePath: string) => {
        const folders = fs.readdirSync(filePath, { withFileTypes: true }).filter(file => file.isDirectory());
        const commandFiles = fs.readdirSync(filePath, { withFileTypes: true }).filter(file => file.name.endsWith('.ts'));
        for (const file of commandFiles) {
            const command = require(path.join(filePath, file.name)).default;
            commands.push(command.name);
        }
        folders.forEach(folder => loadCommands(require('path').join(filePath, folder.name)))
    };
    loadCommands(path.join(__dirname, "commands"))

    return commands.flat();
}


export { getCommands, hasAccess }