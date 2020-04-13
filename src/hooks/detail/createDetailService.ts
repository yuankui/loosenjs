import {HookRegisterConsumer} from "../../HookRegisterConsumer";
import {HookRegister} from "../../HookRegister";
import {KVFactory} from "../../hook-struct/KVFactory";
import path from "path";
import {DetailService} from "../../hook-struct/DetailService";
import {DetailServiceImpl} from "./DetailServiceImpl";

export function createDetailService(): HookRegisterConsumer {
    return {
        name: "DetailService",
        async init(hookRegister: HookRegister): Promise<any> {
            const indexPathHook = hookRegister.getHook<string>('index.path');
            if (indexPathHook == null || indexPathHook.hook == null) {
                throw new Error("empty index.path");
            }
            const kvFactory = hookRegister.getHook<KVFactory>('kv.factory');
            const detailKV = path.join(indexPathHook.hook, 'doc-detail');
            const kv = await kvFactory.hook.create(detailKV);

            hookRegister.register<DetailService>({
                id: 'DetailService',
                name: 'detail.service',
                hook: new DetailServiceImpl(kv),
            })
        }
    }
}