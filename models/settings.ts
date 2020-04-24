import { getModelForClass, prop } from '@typegoose/typegoose';
import { SettingKey } from './enums/settingKey.enum';

class SettingClass {
    @prop() server: string;
    @prop() key: SettingKey;
    @prop() value: string | number | boolean;
    @prop() valueB: string | number | boolean;
}

const Setting = getModelForClass(SettingClass);

export { Setting }