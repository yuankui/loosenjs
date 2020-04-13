import 'mocha';
import {Detail} from "./Detail";
import {range} from "rxjs";
import {flatMap, last} from "rxjs/operators";

const randomInt = (max) => {
    const value = Math.random() * max;
    return parseInt(value.toString());
};


async function run() {
    const detail = await Detail.open('detail.dat');



    // init
    // for (let i = 0; i < 100000; i++) {
    //     console.log(i);
    //     await detail.add(i.toString(), i + 1);
    // }

    // const start = new Date();

    // await range(0, 100)
    //     .pipe(
    //         flatMap(async k => {
    //             const v = randomInt(100);
    //             return await detail.list(v, 10);
    //         }),
    //         last(),
    //     ).toPromise();
    //
    // console.log(`cost: ${new Date().getTime() - start.getTime()}`);


    // for (let i = 0; i < 100; i++) {
    //     await detail.list(i, 10);
    // }
    // console.log(`cost: ${new Date().getTime() - start.getTime()}`);
}

describe('Hello function', () => {

    it('should return hello world', async (context) => {
        const list = await run();
        console.log(list);
    });
});
