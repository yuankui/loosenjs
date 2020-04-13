import {Field} from "../../../hook-struct/Field";
import {BitMutation} from "../../../hook-struct/BitMutation";
import {Doc} from "../../../hook-struct/Doc";
import {Bitset, emptySet} from "../../../hook-struct/Bitset";
import {FieldExpression} from "../../../SearchReq";
import {ReverseIndexRepository} from "../../../hook-struct/ReverseIndexRepository";
import {RequestContext} from "../../../RequestContext";

export class BooleanField implements Field {
    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    async parseAdd(doc: Doc, old: Doc, id: number): Promise<Array<BitMutation>> {
        const name = this.name;
        const value = doc[this.name];
        const oldV = old? old[this.name] : null;

        // 如果值没有改变，就不做调整
        if (value == oldV) {
            return [];
        }

        if (value == null) {
            return [
                {
                    key: `reverse.boolean.${this.name}.null`,
                    bit: 1,
                    index: id,
                }
            ];
        }
        return [
            {
                key: `reverse.boolean.${name}`,
                bit: value ? 1 : 0,
                index: id,
            },
            {
                key: `reverse.boolean.${name}.null`,
                bit: 0,
                index: id,
            }
        ]
    }

    async parseDelete(doc: Doc, id: number): Promise<Array<BitMutation>> {
        const name = this.name;
        // 设置为null
        return [
            {
                key: `reverse.boolean.${name}.null`,
                bit: 1,
                index: id,
            }
        ]
    }

    async search(expr: FieldExpression, repository: ReverseIndexRepository, requestContext: RequestContext): Promise<Bitset | null> {
        // 字段不相符
        if (expr.field != this.name) {
            return null;
        }

        // 字段相符
        const config = expr.config as BooleanExprConfig;

        if (config.type == '=') {
            const nullSet = await repository.getBitset(`reverse.boolean.${this.name}.null`);

            if (config.value == null) {
                return nullSet;
            }
            const trueSet = await repository.getBitset(`reverse.boolean.${this.name}`);

            if (config.value) {
                return trueSet.andNot(nullSet);
            } else {
                return requestContext.fullIds.clone().andNot(nullSet).andNot(trueSet)
            }
        }

        // type不是=，所以无法匹配的文档为0
        return emptySet();
    }
}

type BooleanExprConfig = EqualExpr;

export interface EqualExpr {
    type: "=",
    value: boolean | null,
}

// 这里暂时不支持，因为可以通过 [Not] + [=] 组合而成
// interface NotEqualExpr {
//     type: "!=",
//     value: boolean | null,
// }
