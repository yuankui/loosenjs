import RocksDB from "rocksdb";
import fs from 'fs';
import path from 'path';

export class KV {
    private readonly location: string;
    private rocksdb: RocksDB;

    constructor(path: string) {
        this.location = path;
        this.rocksdb = new RocksDB(path);
    }

    async init() {
        const dir = path.dirname(this.location);
        // 判断父目录是否存在
        const exist = await new Promise((resolve, reject) => {
            fs.lstat(dir, (err, stats) => {
                if (err == null) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
        });

        // 如果不存在，创建目录
        if (!exist) {
            await new Promise((resolve, reject) => {
                fs.mkdir(dir, err => {
                    if (err == null) {
                        resolve();
                    } else {
                        reject(err);
                    }
                })
            })
        }

        // 然后初始化db
        await new Promise((resolve, reject) => {
            this.rocksdb.open(err => {
                if (err == null) {
                    resolve();
                } else {
                    reject(err);
                }
            })
        });
    }

    get(key: string): Promise<Buffer> {
        return new Promise<any>((resolve, reject) => {
            this.rocksdb.get(key, (err, value) => {
                if (err == null) {
                    resolve(value);
                } else {
                    resolve(null);
                }
            })
        })
    }

    async put(key: string, value: any) {
        return new Promise<any>((resolve, reject) => {
            this.rocksdb.put(key, value, (err) => {
                if (err == null) {
                    resolve();
                } else {
                    reject(err);
                }
            })
        })
    }

    async del(key: string) {
        return new Promise<any>((resolve, reject) => {
            this.rocksdb.del(key, (err) => {
                if (err == null) {
                    resolve();
                } else {
                    reject(err);
                }
            })
        })
    }

    iterator() {
        return this.rocksdb.iterator();
    }
}