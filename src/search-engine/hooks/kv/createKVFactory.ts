import {HookRegisterConsumer} from "../../HookRegisterConsumer";
import {HookRegister} from "../../HookRegister";
import {KVFactory} from "../../hook-struct/KVFactory";
import {KV} from "../../KV";

export function createKVFactory(): HookRegisterConsumer {
    return {
        name: "KVFactory",
        async init(hookRegister: HookRegister): Promise<any> {
            hookRegister.register<KVFactory>({
                id: "KVFactory",
                name: "kv.factory",
                hook: {
                    async create(location: string): Promise<KV> {
                        const kv = new KV(location);
                        await kv.init();
                        return kv;
                    }
                }
            })
        }
    }
}