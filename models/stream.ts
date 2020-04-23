import { getModelForClass, prop } from '@typegoose/typegoose';
import { StreamPlatform } from './enums/streamPlatform.enum';

class StreamerClass {
    @prop() server: string;
    @prop() channel?: string;
    @prop() platform: StreamPlatform;
    @prop() name: string;
    @prop() lastSeen?: Date;
    @prop() lastMessageId?: string;
}

const Streamer = getModelForClass(StreamerClass);

export { Streamer }