import {HookRegisterConsumer} from "../../HookRegisterConsumer";
import {HookRegister} from "../../HookRegister";
import {KVFactory} from "../../hook-struct/KVFactory";
import {IdMapper} from "../../hook-struct/IdMapper";
import path from 'path';

export function createIdMapper() : HookRegisterConsumer {
    return {
        name: 'IdMapper',
        async init(hookRegister: HookRegister): Promise<any> {
            const indexPathHook = hookRegister.getHook<string>('index.path');
            if (indexPathHook == null || indexPathHook.hook == null) {
                throw new Error("empty index.path");
            }
            const kvFactory = hookRegister.getHook<KVFactory>('kv.factory');
            const idMapperPath = path.join(indexPathHook.hook, 'id-mapper');
            const kv = await kvFactory.hook.create(idMapperPath);

            hookRegister.register<IdMapper>({
                id: 'idMapper',
                name: 'id.mapper',
                hook: {
                    async map(namespace: string, id: string): Promise<number> {
                        const seedKey = `${namespace}.$`;
                        const key = `${namespace}.${id}`;

                        const idBuffer = await kv.get(key);
                        // 存在就返回
                        if (idBuffer != null) {
                            return parseInt(idBuffer.toString("utf-8"));
                        }

                        // 否则就递增，创建一个新的
                        const maxId = await kv.get(seedKey);
                        if (maxId == null) {
                            // 种子不存在，就建一个种子
                            await kv.put(seedKey, "1");
                            // 并且把映射写进去
                            await kv.put(key, '1');
                            return 1;
                        }

                        // 种子存在，就在种子的基础上+1
                        const newId = parseInt(maxId.toString("utf-8")) + 1;
                        await kv.put(seedKey, newId.toString());
                        await kv.put(key, newId.toString());
                        return newId;
                    },
                    async get(namespace: string, id: string): Promise<number | null> {
                        const key = `${namespace}.${id}`;
                        const idBuffer = await kv.get(key);
                        // 存在就返回
                        if (idBuffer != null) {
                            return parseInt(idBuffer.toString("utf-8"));
                        }
                        return null;
                    }
                }
            })

        }
    }
}