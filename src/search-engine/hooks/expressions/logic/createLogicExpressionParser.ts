import {HookRegisterConsumer} from "../../../HookRegisterConsumer";
import {HookRegister} from "../../../HookRegister";
import {ExpressionParser} from "../ExpressionParser";
import {Expression} from "../../../SearchReq";
import {Bitset} from "../../../hook-struct/Bitset";
import {FactoryParser} from "../FactoryParser";
import {Field} from "../../../hook-struct/Field";
import {ReverseIndexRepository} from "../../../hook-struct/ReverseIndexRepository";
import {AndExpressionParser} from "./AndExpressionParser";
import {OrExpressionParser} from "./OrExpressionParser";
import {NotExpressionParser} from "./NotExpressionParser";

export function createLogicExpressionParser(): HookRegisterConsumer {
    return {
        name: "Field Expression Parser",
        async init(hookRegister: HookRegister): Promise<any> {
            hookRegister.register<ExpressionParser>({
                id: "Field Expression Parser",
                name: "expression.parser",
                hook: new AndExpressionParser(),
            });

            hookRegister.register<ExpressionParser>({
                id: "Field Expression Parser",
                name: "expression.parser",
                hook: new OrExpressionParser(),
            });

            hookRegister.register<ExpressionParser>({
                id: "Field Expression Parser",
                name: "expression.parser",
                hook: new NotExpressionParser(),
            });
        }
    }
}