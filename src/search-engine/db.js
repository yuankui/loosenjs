const Rocksdb = require('rocksdb');

class DB {
    constructor(path) {
        this.db = new Rocksdb(path);
    }

    open() {
        return new Promise((resolve, reject) => {
            this.db.open(err => {
                if (err == null) {
                    resolve();
                } else {
                    reject(err);
                }
            })
        })
    }

    get(key) {
        return new Promise((resolve, reject) => {
            this.db.get(key, (err, value) => {
                if (err == null) {
                    resolve(value);
                } else {
                    reject(err)
                }
            })
        })
    }

    put(key, value) {
        return new Promise((resolve, reject) => {
            this.db.put(key, value, err => {
                if (err == null) {
                    resolve()
                } else {
                    reject(err)
                }
            })
        })
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close(err => {
                if (err == null) {
                    resolve();
                } else {
                    reject(err);
                }
            })
        })
    }

    batch(ops) {
        return new Promise((resolve, reject) => {
            // const ops = Object.entries(kvs)
            //     .map(kv => {
            //         const [k, v] = kv;
            //         return {
            //             type: 'put',
            //             key: k,
            //             value: v
            //         };
            //     });
            this.db.batch(ops, err => {
                if (err == null) {
                    resolve()
                } else {
                    reject(err);
                }
            })
        })
    }
}

exports.DB = DB;