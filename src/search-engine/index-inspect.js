const {RoaringBitmap32} = require("roaring");

const RocksDB = require("rocksdb");


async function next(iter) {
    return new Promise((resolve, reject) => {
        iter.next((err, key, value) => {
            if (err) {
                reject(err);
            } else {
                resolve([key, value]);
            }
        });
    })
}

async function scanDetail(type) {
    const rocksdb = new RocksDB('/Users/yuankui/git/grace-editor/index.dat/' + type);

    await new Promise(resolve => {
        rocksdb.open(async err => {
            console.log('');
            console.log(`=================index name [${type}]====================`);
            console.log('');
            const iterator = rocksdb.iterator();
            for (let i = 0; i < 1000; i++) {
                const [key, value] = await next(iterator);

                if (key == null && value == null) {
                    break;
                }
                console.log(`${key} => ${value}`)
            }
            resolve();
        });
    })
}

async function scanBitmap(type) {
    const rocksdb = new RocksDB('/Users/yuankui/git/grace-editor/index.dat/' + type);

    await new Promise(resolve => {
        rocksdb.open(async err => {
            console.log('');
            console.log(`=================index name [${type}]====================`);
            console.log('');
            const iterator = rocksdb.iterator();
            for (let i = 0; i < 1000; i++) {
                const [key, value] = await next(iterator);

                if (key == null && value == null) {
                    break;
                }

                const bitmap = RoaringBitmap32.deserialize(value, true);
                console.log(`${JSON.stringify(key.toString())} => ${JSON.stringify(bitmap.toArray())}`)
            }
            resolve();
        });
    })
}

async function run() {
    await scanDetail('doc-detail');
    await scanDetail('id-mapper');
    await scanBitmap('reverse_index');
}


run().then(value => {});
