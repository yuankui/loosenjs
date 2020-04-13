import {Field} from "../../../hook-struct/Field";
import {BitMutation} from "../../../hook-struct/BitMutation";
import {Doc} from "../../../hook-struct/Doc";
import {Bitset, emptySet} from "../../../hook-struct/Bitset";
import {ReverseIndexRepository} from "../../../hook-struct/ReverseIndexRepository";
import {FieldExpression} from "../../../SearchReq";
import {range} from "rxjs";
import {flatMap, toArray} from "rxjs/operators";
import {RequestContext} from "../../../RequestContext";

/**
 * 由于处理负数比较麻烦，所以这里将所有的数字，加上2**31
 *
 * 注意，数字范围为[0, 2**32-1]
 * 如果是负数，不能超过 [-2**31, 2**31 - 1]
 */
const MinInt = -(2 ** 31);
const MaxInt = 2 ** 31 - 1;
const Shift = 2 ** 31;

export class IntegerField implements Field {
    readonly name: string;


    constructor(name: string) {
        this.name = name;
    }

    async parseAdd(doc: Doc, old: Doc, id: number): Promise<Array<BitMutation>> {
        const value = doc[this.name];
        const oldValue = old ? old[this.name] : null;

        // 相等，就不做更改
        if (value == oldValue) {
            return [];
        }

        return this.encode(value, id);
    }

    empty(id: number, bit: 1 |0): BitMutation {
        return {
            key: `reverse.int.${this.name}.null`,
            bit: bit,
            index: id,
        }
    }

    encode(value: any, id: number): Array<BitMutation> {
        // 为空，就设置为null
        if (value == null) {
            return [this.empty(id, 1)];
        }

        // 2. 不是整形，试着做下转换
        if (typeof value !== 'number') {
            const v = parseInt(value.toString());
            if (Number.isNaN(value)) {
                console.log(`not a number, ${this.name} => ${value}`);
                // 转换失败，索引设置为null
                return [this.empty(id, 1)];
            }
            value = v;
        }

        // 3. 无论是转换之前的，还是转换之后，都进行正化
        if (value > MaxInt || value < MinInt) {
            console.error(`value exceed scope, not indexing, ${this.name} => ${value}`);
            return [
                this.empty(id, 1),
            ];
        }
        const n = value + Shift;
        const binary: string = n.toString(2);

        // BSI encoding: https://www.pilosa.com/blog/range-encoded-bitmaps/
        const intBits = binary.split('')
            .reverse()
            .map((v, i) => {
                return <BitMutation>{
                    key: `reverse.int.${this.name}.${i}`,
                    index: id,
                    bit: v === '1' ? 1 : 0,
                }
            });

        return [...intBits, this.empty(id, 0)];
    }


    async parseDelete(doc: Doc, id: number): Promise<Array<BitMutation>> {
        return [this.empty(id, 1)];
    }

    async search(expr: FieldExpression, repository: ReverseIndexRepository, requestContext: RequestContext): Promise<Bitset | null> {
        // 字段不相符
        if (expr.field != this.name) {
            return null;
        }

        // 字段相符
        const config = expr.config as CompareExpr;

        // 1. get value
        const valueSets = await range(0, 32)
            .pipe(
                flatMap(i => {
                    const key = `reverse.int.${this.name}.${i}`;
                    return repository.getBitset(key);
                }),
                toArray(),
            )
            .toPromise();

        // 2. get null set, 1 == null, 0 == not-null
        const nullSet = await repository.getBitset(`reverse.int.${this.name}.null`);
        const existSet = requestContext.fullIds.clone().andNot(nullSet);

        // 3. 比较，等到[大于集，等于集，小于集]
        const [greater, equal, lower] = this.compare(config.value, valueSets, existSet);

        switch (config.type) {
            case "<":
                return lower;
            case "<=":
                return lower.or(equal);
            case "=":
                return equal;
            case ">":
                return greater;
            case ">=":
                return greater.or(equal);
            default:
                return null;
        }
    }

    compare(num: number, valueSets: Array<Bitset>, fullIds: Bitset): [Bitset,Bitset,Bitset] {
        // 把num转换成二进制，然后一位一位地和valueSet进行比较
        const numBits = num.toString(2).split('');

        // 初始化3个集合，[大于集，不确定集，小于集]
        const greaterSet = emptySet();
        const lowerSet = emptySet();
        const uncertainSet = fullIds.clone();

        // 然后循环，一位一位比较
        for (let i = 31; i >= 0; i++) {
            const bit = numBits[i] || '0';
            const bitset = valueSets[i];

            // 分3种情况
            if (bit == '0') {
                // 从不确定集中找出1的集合，列入【大于集】
                const oneSet = uncertainSet.clone().and(bitset);
                greaterSet.or(oneSet);

                // 然后剔除这部分1的集合
                uncertainSet.andNot(oneSet);
            } else { // == '1'
                // 从不确定集中找出0的集合，列入【小于集】
                const zeroSet = uncertainSet.clone().andNot(bitset);
                lowerSet.or(zeroSet);

                // 然后剔除这部分1的集合
                uncertainSet.andNot(zeroSet);
            }
        }

        // 循环完了还没确定的，就是等于的了。
        return [greaterSet, uncertainSet, lowerSet]
    }
}

export interface CompareExpr {
    type: "=" | ">" | "<" | '<=' | ">=",
    value: number,
}