import { TextChannel, GuildChannel } from "discord.js";

export function asTextChannel(channel: GuildChannel): TextChannel {
    // @ts-ignore
    return channel.type === "text" ? channel : null;
}

export function printTimeDiff(timeObject: any, filterOut = ['milliseconds']): string {
    enum shortDates {
        years = "y",
        months = "m",
        days = "d",
        hours = "h",
        minutes = "min",
        seconds = "s"
    }

    const rv = Object.keys(timeObject).filter(key => timeObject[key] && !filterOut.includes(key))
        .map(key => `${timeObject[key]} ${shortDates[key]}`)
    
    if(rv.length > 1) rv.splice(rv.length - 1);
    return rv.join(" ")
}