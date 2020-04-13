import {HookRegisterConsumer} from "../../HookRegisterConsumer";
import {HookRegister} from "../../HookRegister";
import {ReverseMutationFactory} from "../../hook-struct/ReverseMutationFactory";
import {BitMutation} from "../../hook-struct/BitMutation";
import {Doc} from "../../hook-struct/Doc";
import {Field} from "../../hook-struct/Field";

export function createReverseIndexFactory(): HookRegisterConsumer {
    return {
        name: 'ReverseIndex',
        async init(hookRegister: HookRegister): Promise<any> {
            hookRegister.register<ReverseMutationFactory>({
                id: 'ReverseIndex',
                name: 'reverse.mutations.factory',
                hook: {
                    async processAdd(doc: Doc, docId: number, oldDoc: Doc | null): Promise<Array<BitMutation>> {
                        const fields = hookRegister.getHooks<Field>('index.field');

                        const fullMutations: Array<BitMutation> = [];
                        for (let field of fields) {
                            const mutations = await field.hook.parseAdd(doc, oldDoc, docId);
                            fullMutations.push(...mutations);
                        }
                        return fullMutations;
                    },

                    async processDelete(doc: Doc, docId: number): Promise<Array<BitMutation>> {
                        const fields = hookRegister.getHooks<Field>('index.field');
                        const fullMutations: Array<BitMutation> = [];
                        for (let field of fields) {
                            const mutations = await field.hook.parseDelete(doc, docId);
                            fullMutations.push(...mutations);
                        }
                        return fullMutations;
                    }
                }
            })
        }
    }
}