import {Field} from "../../../hook-struct/Field";
import {BitMutation} from "../../../hook-struct/BitMutation";
import jieba from "nodejieba";
import {Doc} from "../../../hook-struct/Doc";
import {FieldExpression} from "../../../SearchReq";
import {ReverseIndexRepository} from "../../../hook-struct/ReverseIndexRepository";
import {Bitset} from "../../../hook-struct/Bitset";
import {RequestContext} from "../../../RequestContext";

jieba.load();

export class TextField implements Field {
    private readonly _name: string;

    constructor(name: string) {
        this._name = name;
    }

    get name() {
        return this._name;
    }

    async parseAdd(doc: Doc, old: Doc, id: number): Promise<Array<BitMutation>> {
        const value = doc[this.name];
        const oldValue = old? old[this.name] : null;
        if (value == oldValue) {
            return [];
        }

        // remove old mutation
        const removeMutations = this.encode(oldValue, 0, id);

        // insert new mutation
        const addMutations = this.encode(value, 1, id);

        return [...removeMutations, ...addMutations];
    }

    cut(text: string) {
        return jieba.cutForSearch(text, true) || [];
    }

    key(word: string) {
        return `reverse.text.${this.name}.${word}`;
    }

    encode(value: string, bit: 0 | 1, id: number): Array<BitMutation> {
        if (value == null) {
            return [];
        }
        const words = this.cut(value);
        return words.map(word => {
            return {
                key: this.key(word),
                index: id,
                bit: bit,
            }
        });
    }
    async parseDelete(doc: Doc, id: number): Promise<Array<BitMutation>> {
        const value = doc[this.name];

        // remove, set bit = 0
        return this.encode(value, 0, id);
    }

    async search(expr: FieldExpression, repository: ReverseIndexRepository, requestContext: RequestContext): Promise<Bitset | null> {
        // 字段不相符
        if (expr.field != this.name) {
            return null;
        }

        const config = expr.config as TextExpr;

        // 目前仅仅支持query查询方式
        if (config.type !== 'query') {
            return null;
        }

        // 如果查询词位空，就报错
        if (config.text == null) {
            throw new Error(`empty text for expr: ${JSON.stringify(expr)}`);
        }

        const words = this.cut(config.text.toString());

        const result = requestContext.fullIds.clone();

        // 目前是或且的关系，后续支持或的关系，并且支持匹配度排序
        for (let word of words) {
            const bitset = await repository.getBitset(this.key(word));

            // 且。 TODO 后续支持或
            result.and(bitset);
        }

        return result;
    }
}

export interface TextExpr {
    type: 'query',
    text: string,
}

// TODO 新增一个title-text类型，专门针对长度不大的text进行索引
// 因为这部分的匹配，必须要求精确
// 所以这里的方法是，将title，按照长度是