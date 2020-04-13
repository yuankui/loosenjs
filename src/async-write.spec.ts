import {test} from 'mocha';
import chaiArrays from "chai-arrays";
import chai from 'chai';
import {range} from "rxjs";
import * as op from 'rxjs/operators';

chai.use(chaiArrays);

test('async-write', async function() {
    range(1000, 1000)
        .pipe(
            op.groupBy(i => i % 10),
            op.mergeMap(group => {
                return group.pipe(
                    op.toArray(),
                ).toPromise();
            })
        )
        .subscribe(value => {
            console.log(`value :${JSON.stringify(value)}`);
        })

})
    .timeout(50_000);
