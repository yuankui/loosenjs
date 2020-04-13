import {HookRegisterConsumer} from "../../../HookRegisterConsumer";
import {HookRegister} from "../../../HookRegister";
import {Field} from "../../../hook-struct/Field";
import {IDField} from "./IDField";

export function createIdFieldRegister(): HookRegisterConsumer {
    return {
        name: "ID Field Register",
        async init(hookRegister: HookRegister): Promise<any> {
            hookRegister.register<Field>({
                id: 'all doc field',
                name: 'index.field',
                hook: new IDField('_id', hookRegister),
            })
        }
    }
}