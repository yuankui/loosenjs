import {HookRegisterConsumer} from "../../HookRegisterConsumer";
import {HookRegister} from "../../HookRegister";
import {Pager} from "../../hook-struct/Pager";
import {Page} from "../../hook-struct/Page";
import {Bitset} from "../../hook-struct/Bitset";
import {from} from "rxjs";
import {skip, take, toArray} from "rxjs/operators";

export function createPagerHook(): HookRegisterConsumer {
    return {
        name: 'Pager Hook',
        async init(hookRegister: HookRegister): Promise<any> {
            hookRegister.register<Pager>({
                id: 'pager',
                name: 'pager',
                hook: {
                    async page(bitset: Bitset, page: Page): Promise<Array<number>> {
                        const array = await from(bitset)
                            .pipe(
                                skip(page.pageSize * page.page),
                                take(page.pageSize),
                                toArray(),
                            )
                            .toPromise();
                        return array;
                    }
                }
            });
        }
    }
}