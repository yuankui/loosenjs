import {RoaringBitmap32} from "roaring";
import {KV} from "./KV";

export class ReverseMap {
    private readonly path: string;
    private kv: KV;

    constructor(path: string) {
        this.path = path;
        this.kv = new KV(path);
    }

    async init() {
        await this.kv.init();
    }

    async equal(token: string): Promise<RoaringBitmap32> {
        if (this.kv == null) {
            throw new Error("empty");
        }
        const buffer = await this.kv.get(token);
        return RoaringBitmap32.deserialize(buffer, true);
    }

    async set(token: string, bitmap: RoaringBitmap32) {
        if (this.kv == null) {
            throw new Error("empty");
        }
        await this.kv.put(token, bitmap.serialize(true));
    }

    async get(token: string) {
        return this.equal(token);
    }
}