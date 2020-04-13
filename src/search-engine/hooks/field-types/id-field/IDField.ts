import {Field} from "../../../hook-struct/Field";
import {Doc} from "../../../hook-struct/Doc";
import {BitMutation} from "../../../hook-struct/BitMutation";
import {Bitset, emptySet, newSet} from "../../../hook-struct/Bitset";
import {FieldExpression} from "../../../SearchReq";
import {ReverseIndexRepository} from "../../../hook-struct/ReverseIndexRepository";
import {EqualExpr} from "../boolean-type/BooleanField";
import {HookRegister} from "../../../HookRegister";
import {IdMapper} from "../../../hook-struct/IdMapper";
import {RequestContext} from "../../../RequestContext";

export class IDField implements Field {
    readonly name: string;
    private hookRegister: HookRegister;

    constructor(name: string, hookRegister: HookRegister) {
        this.name = name;
        this.hookRegister = hookRegister;
    }

    async parseAdd(doc: Doc, old: Doc | null, id: number): Promise<Array<BitMutation>> {
        return [
            {
                index: id,
                bit: 1,
                key: `inverted.full_id`,
            }
        ]
    }

    async parseDelete(doc: Doc, id: number): Promise<Array<BitMutation>> {
        return [
            {
                index: id,
                bit: 0,
                key: `inverted.full_id`,
            }
        ]
    }

    async search(expr: FieldExpression, repository: ReverseIndexRepository, requestContext: RequestContext): Promise<Bitset | null> {
        // 字段不相符
        if (expr.field != this.name) {
            return null;
        }

        // 字段相符
        const config = expr.config as EqualExpr;

        if (config.type == '=') {
            const strId = JSON.stringify(config.value);
            const idMapperHook = this.hookRegister.getHook<IdMapper>('id.mapper');
            const numberId = await idMapperHook.hook.get('_id', strId);
            if (numberId == null) {
                // 映射不了id，直接返回空集
                return emptySet();
            }

            // 能映射成id，看看全集里面有没有
            const idSet = newSet();
            idSet.add(numberId);
            idSet.and(requestContext.fullIds);
            return idSet;
        }

        // type不是=，所以无法匹配的文档为0
        return emptySet();
    }

}