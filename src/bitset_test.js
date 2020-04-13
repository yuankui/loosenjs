const {BitSet} = require('bitset');
const byteBuffer = require('bytebuffer');

const bitset = new BitSet();


const randomInt = (max) => {
    const value = Math.random() * max;
    return parseInt(value.toString());
};


for (let i = 0; i < 1000000; i++) {
    const bool = randomInt(100) % 2 === 0;
    if (bool) {
        bitset.set(i, 1);
    }
}

let buffer = byteBuffer.allocate(10);
bitset.data.forEach(num => {
    buffer.writeInt32(num);
});

buffer.offset = 0;

const array = [];

for (let i = 0; i < bitset.data.length; i++) {
    array.push(buffer.readInt32());
}

const bitset2 = new BitSet();
bitset2.data = array;

console.log(bitset.slice(0, 100).toArray());
console.log(bitset2.slice(0, 100).toArray());
