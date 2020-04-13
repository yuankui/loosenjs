import {Bitset} from "./Bitset";
import {Page} from "./Page";

export interface Pager {
    page(bitset: Bitset, page: Page): Promise<Array<number>>;
}