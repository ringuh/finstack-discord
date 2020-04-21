const config: ConfigInterface = require('../config.json');
import { connect } from 'mongoose';
import { ConfigInterface } from './interfaces/config.interface';
import { ServerRole } from './serverRoles';
connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });


export { config, ServerRole };