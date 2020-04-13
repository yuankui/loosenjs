import {Doc} from "./Doc";

export interface DetailService<T extends Doc = Doc> {
    get(id: number): Promise<T | null>;
    set(id: number, doc: T): Promise<any>;
    del(id: number): Promise<any>;
}