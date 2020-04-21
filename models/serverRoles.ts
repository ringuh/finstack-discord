import { getModelForClass, prop } from '@typegoose/typegoose';

class ServerRoleClass {
    @prop() server: string;
    @prop() role: string;
    @prop() channel?: string;
    @prop() admin?: string;
}

const ServerRole = getModelForClass(ServerRoleClass);

export { ServerRole }