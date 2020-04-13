import {Expression} from "../../SearchReq";
import {Bitset} from "../../hook-struct/Bitset";

export interface FactoryParser {
    /**
     * if return null, can't parse
     */
    filter(expr: Expression): Promise<Bitset>;
}