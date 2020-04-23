export interface ConfigInterface {
    discord_token: string;
    repeat_token: string;
    prefix: string;
    bypass_list: string[];
    bypass_bots: string[];
    database: string;
    message_lifespan: number;
    twitch_interval: number;
    twitch_clientID: string;
    twitch_clientSecret: string;
}