import {HookRegisterConsumer} from "../../HookRegisterConsumer";
import {HookRegister} from "../../HookRegister";
import {DocChecker} from "../../hook-struct/DocChecker";
import {Doc} from "../../hook-struct/Doc";

export function createIdChecker(): HookRegisterConsumer {
    return {
        name: "Id Checker",
        async init(hookRegister: HookRegister): Promise<any> {
            hookRegister.register<DocChecker>({
                id: 'Id Checker',
                name: 'doc.checker',
                hook: {
                    check(doc: Doc) {
                        if (doc._id == null) {
                            throw new Error("empty id field");
                        }
                    }
                }
            })
        }
    }
}