import {BitMutation} from "./BitMutation";
import {Bitset} from "./Bitset";

/**
 * 负责倒排索引的存储，查询，删除
 */
export interface ReverseIndexRepository {
    mutate(mutate: BitMutation): Promise<any>;
    getBitset(key: string): Promise<Bitset>;
}