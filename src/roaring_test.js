const {RoaringBitmap32} = require('roaring');
const roaring = new RoaringBitmap32();


const randomInt = (max) => {
    const value = Math.random() * max;
    return parseInt(value.toString());
};


for (let i = 0; i < 100; i++) {
    const int = randomInt(100000);
    roaring.add(int);
}

console.log(roaring.toArray());
console.log(roaring.size);

const buffer = roaring.serialize(true);

console.log(buffer);
