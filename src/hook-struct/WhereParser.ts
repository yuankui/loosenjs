import {Expression} from "../SearchReq";
import {Bitset} from "./Bitset";
import {RequestContext} from "../RequestContext";

export interface WhereParser {
    filter(where: Expression, requestContext: RequestContext): Promise<Bitset>;
}