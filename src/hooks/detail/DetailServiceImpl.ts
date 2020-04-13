import {DetailService} from "../../hook-struct/DetailService";
import {Doc} from "../../hook-struct/Doc";
import {KV} from "../../KV";

export class DetailServiceImpl implements DetailService {
    private kv: KV;

    constructor(kv: KV) {
        this.kv = kv;
    }

    async del(id: number): Promise<any> {
        await this.kv.del(id.toString());
    }

    async get(id: number): Promise<Doc | null> {
        const buffer = await this.kv.get(id.toString());
        if (buffer == null) {
            return null;
        }
        const str = buffer.toString('utf-8');
        return JSON.parse(str);
    }

    async set(id: number, doc: Doc): Promise<any> {
        await this.kv.put(id.toString(), JSON.stringify(doc));
    }
}