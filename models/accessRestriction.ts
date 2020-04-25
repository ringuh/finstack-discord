import { getModelForClass, prop } from '@typegoose/typegoose';
import { SettingKey } from './enums/settingKey.enum';

class Class {
    @prop() server: string;
    @prop() type
    @prop() channel: SettingKey;
    @prop() value: string | number | boolean;
    @prop() valueB: string | number | boolean;
}

const Setting = getModelForClass(SettingClass);

export { Setting }