import {ExpressionParser} from "../ExpressionParser";
import {Expression} from "../../../SearchReq";
import {Bitset} from "../../../hook-struct/Bitset";
import {FactoryParser} from "../FactoryParser";

export class OrExpressionParser implements ExpressionParser {
    async filter(expr: Expression, parser: FactoryParser): Promise<Bitset | null> {
        if (expr.type != 'or') {
            return null;
        }

        const left = await parser.filter(expr.left);
        const right = await parser.filter(expr.right);
        return left.or(right);
    }
}