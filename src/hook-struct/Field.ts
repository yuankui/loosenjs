import {BitMutation} from "./BitMutation";
import {Doc} from "./Doc";
import {Bitset} from "./Bitset";
import {FieldExpression} from "../SearchReq";
import {ReverseIndexRepository} from "./ReverseIndexRepository";
import {RequestContext} from "../RequestContext";

/**
 * 字段，用于将字段break成倒排索引
 */
export interface Field {
    // 解析doc，生成token
    // 如果分词为空，就返回[]
    parseAdd(doc: Doc, old: Doc | null, id: number): Promise<Array<BitMutation>>;
    parseDelete(doc: Doc, id: number): Promise<Array<BitMutation>>;
    search(expr: FieldExpression, repository: ReverseIndexRepository, requestContext: RequestContext): Promise<Bitset|null>;
    readonly name: string;
}