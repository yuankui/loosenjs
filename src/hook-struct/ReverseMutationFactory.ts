import {Doc} from "./Doc";
import {BitMutation} from "./BitMutation";

export interface ReverseMutationFactory<T extends Doc = Doc> {
    processAdd(doc: T, docId: number, oldDoc: T | null): Promise<Array<BitMutation>>;
    processDelete(doc: T, docId: number, reverse?: boolean): Promise<Array<BitMutation>>;
}