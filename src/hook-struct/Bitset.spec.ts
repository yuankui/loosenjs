import {test} from "mocha";
import {newSet} from "./Bitset";
import chai from 'chai';

import assertArrays from 'chai-arrays';

chai.use(assertArrays);
chai.should();

test('bit-set-test', async function () {
    const value = [1, 3, 5, 6, 7, 9];
    const set = newSet(value);

    set.toArray().should.to.be.equalTo(value);
});

test('and', async function () {
    const a = newSet([1, 2, 3, 4]);
    const b = newSet([3, 4, 5, 6]);

    a.and(b);

    a.toArray().should.to.be.equalTo([3, 4]);
});

test('or', async function () {
    const a = newSet([1, 2, 3, 4]);
    const b = newSet([3, 4, 5, 6]);

    a.or(b);

    a.toArray().should.to.be.equalTo([1, 2, 3, 4, 5, 6]);
});


test('andNot', async function () {
    const a = newSet([1, 2, 3, 4]);
    const b = newSet([3, 4, 5, 6]);

    a.andNot(b);

    a.toArray().should.to.be.equalTo([1, 2]);
});


test('andNot', async function () {
    const a = newSet([1, 2, 3, 4]);

    a.remove(3);

    a.toArray().should.to.be.equalTo([1, 2, 4]);
});

