import {KV} from "./KV";

export class Detail<T = any> {
    private path: string;
    private readonly kv: KV;

    constructor(path: string) {
        this.path = path;
        this.kv = new KV(path);
    }

    async init() {
        await this.kv.init();
    }

    async add(docId: string, doc: T) {
        if (this.kv == null) {
            throw new Error("empty kv");
        }
        await this.kv.put(docId, JSON.stringify(doc));
    }

    async get(docId: string): Promise<T> {
        if (this.kv == null) {
            throw new Error("empty kv");
        }
        const buffer = await this.kv.get(docId);
        return JSON.parse(buffer.toString('utf-8'));
    }

    async remove(docId: string) {
        if (this.kv == null) {
            throw new Error("empty kv");
        }
        await this.kv.del(docId);
    }

    async list(page: number, pageSize: number): Promise<Array<T>> {
        if (this.kv == null) {
            throw new Error("empty kv");
        }
        const iterator = this.kv.iterator();
        const next = async (iter) => {
            return new Promise<any>((resolve, reject) => {
                iterator.next((err, key, value) => {
                    if (err == null) {
                        resolve([key, value]);
                    } else {
                        reject(err);
                    }
                })
            })
        };
        // 1. skip
        for (let i = 0; i < page * pageSize; i++) {
            await next(iterator);
        }

        const array = <any>[];
        // 2. get
        for (let i = 0; i < pageSize; i++) {
            const [key, value] = await next(iterator);
            if (key == undefined && value == undefined) {
                break;
            }
            array.push(JSON.parse(value.toString()));
        }
        return array;
    }
}