import {HookRegister} from "./HookRegister";

export interface HookRegisterConsumer {
    name: string;
    init(hookRegister: HookRegister): Promise<any>;
}