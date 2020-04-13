import {Expression} from "../../SearchReq";
import {Bitset} from "../../hook-struct/Bitset";
import {FactoryParser} from "./FactoryParser";
import {RequestContext} from "../../RequestContext";

export interface ExpressionParser {
    /**
     * if return null, can't parse
     */
    filter(expr: Expression, parser: FactoryParser, requestContext: RequestContext): Promise<Bitset|null>;
}