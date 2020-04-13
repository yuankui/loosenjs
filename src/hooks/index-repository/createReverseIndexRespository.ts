import {ReverseIndexRepository} from "../../hook-struct/ReverseIndexRepository";
import {HookRegisterConsumer} from "../../HookRegisterConsumer";
import {HookRegister} from "../../HookRegister";
import {BitMutation} from "../../hook-struct/BitMutation";
import path from 'path';
import {KVFactory} from "../../hook-struct/KVFactory";
import {RoaringBitmap32} from "roaring";
import {Bitset, emptySet, newSet} from "../../hook-struct/Bitset";

export function createReverseIndexRepository(): HookRegisterConsumer {
    return {
        name: "ReverseIndexRepository",
        async init(hookRegister: HookRegister): Promise<any> {

            // 计算倒排索引文件路径
            const indexPathHook = hookRegister.getHook<string>('index.path');
            const indexPath = indexPathHook.hook;
            const reverseIndexPath = path.join(indexPath, 'reverse_index');

            const kvFactoryHook = hookRegister.getHook<KVFactory>('kv.factory');
            const kv = await kvFactoryHook.hook.create(reverseIndexPath);

            hookRegister.register<ReverseIndexRepository>({
                id: 'ReverseIndexRepository',
                name: 'reverse.index.repository',
                hook: {
                    async mutate(mutate: BitMutation): Promise<any> {
                        const buffer = await kv.get(mutate.key);
                        let bitmap: RoaringBitmap32 | null = null;
                        if (buffer == null) {
                            // 如果token不存在，就新建一个
                            bitmap = new RoaringBitmap32();
                        } else {
                            // 如果存在，就新set一位
                            try {
                                bitmap = RoaringBitmap32.deserialize(buffer, true);
                            } catch (e) {
                                console.error(e);
                                bitmap = new RoaringBitmap32();
                            }
                        }

                        // 跟新bit位
                        if (mutate.bit === 0) {
                            bitmap.remove(mutate.index);
                        } else {
                            bitmap.add(mutate.index);
                        }

                        await kv.put(mutate.key, bitmap.serialize(true));
                    },

                    async getBitset(key: string): Promise<Bitset> {
                        const buffer = await kv.get(key);
                        if (buffer == null) {
                            return emptySet();
                        }

                        const bitmap = RoaringBitmap32.deserialize(buffer, true);
                        return newSet(bitmap);
                    }

                }
            })
        }
    }

}