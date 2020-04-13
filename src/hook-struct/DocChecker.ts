import {Doc} from "./Doc";

export interface DocChecker<T extends Doc = Doc> {
    check(doc: T);
}