import {ExpressionParser} from "../ExpressionParser";
import {Expression} from "../../../SearchReq";
import {Bitset} from "../../../hook-struct/Bitset";
import {FactoryParser} from "../FactoryParser";
import {RequestContext} from "../../../RequestContext";

export class NotExpressionParser implements ExpressionParser {
    async filter(expr: Expression, parser: FactoryParser, requestContext: RequestContext): Promise<Bitset | null> {
        if (expr.type != 'not') {
            return null;
        }

        const inner = await parser.filter(expr.inner);

        return requestContext.fullIds.clone().andNot(inner);
    }
}