const config: ConfigInterface = require('../config.json');
import { connect } from 'mongoose';
import { ConfigInterface } from './interfaces/config.interface';
import { ServerRole } from './serverRoles';
import TwitchClient, { AccessToken } from 'twitch';
connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });



const twitchClient = TwitchClient.withClientCredentials(config.twitch_clientID, config.twitch_clientSecret);

export { config, twitchClient, ServerRole };