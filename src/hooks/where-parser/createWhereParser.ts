import {HookRegisterConsumer} from "../../HookRegisterConsumer";
import {HookRegister} from "../../HookRegister";
import {WhereParser} from "../../hook-struct/WhereParser";
import {Bitset} from "../../hook-struct/Bitset";
import {Expression} from "../../SearchReq";
import {ExpressionParser} from "../expressions/ExpressionParser";
import {FactoryParser} from "../expressions/FactoryParser";
import {RequestContext} from "../../RequestContext";

export function createWhereParser(): HookRegisterConsumer {
    return {
        name: "WhereParser",
        async init(hookRegister: HookRegister): Promise<any> {

            const hook: WhereParser = {
                async filter(expr: Expression, requestContext: RequestContext): Promise<Bitset> {
                    const exprParsers = hookRegister.getHooks<ExpressionParser>('expression.parser');

                    const factoryParser: FactoryParser = {
                        async filter(expr: Expression): Promise<Bitset> {
                            return hook.filter(expr, requestContext);
                        }
                    };

                    for (let parser of exprParsers) {
                        const bitset = await parser.hook.filter(expr, factoryParser, requestContext);
                        if (bitset != null) {
                            return bitset;
                        }
                    }

                    throw new Error("can not parser where clause:" + JSON.stringify(expr));
                }
            };
            // 过滤
            hookRegister.register<WhereParser>({
                id: 'where parser',
                name: 'where.parser',
                hook: hook,
            })
        }
    }
}