import {HookRegister} from "./HookRegister";

export abstract class Filter {
    abstract async init(hookRegister: HookRegister);
}