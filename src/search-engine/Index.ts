import {SearchReq} from "./SearchReq";
import {HookRegister} from "./HookRegister";
import {HookRegisterConsumer} from "./HookRegisterConsumer";
import {Doc} from "./hook-struct/Doc";
import {DocChecker} from "./hook-struct/DocChecker";
import {IdMapper} from "./hook-struct/IdMapper";
import {DetailService} from "./hook-struct/DetailService";
import {ReverseMutationFactory} from "./hook-struct/ReverseMutationFactory";
import {WhereParser} from "./hook-struct/WhereParser";
import {Pager} from "./hook-struct/Pager";
import {createWhereParser} from "./hooks/where-parser/createWhereParser";
import {createIdChecker} from "./hooks/doc-checker/createIdChecker";
import {createReverseIndexFactory} from "./hooks/reverse-index/createReverseIndexFactory";
import {createKVFactory} from "./hooks/kv/createKVFactory";
import {ReverseIndexRepository} from "./hook-struct/ReverseIndexRepository";
import {createIdMapper} from "./hooks/id-mapper/createIdMapper";
import {createDetailService} from "./hooks/detail/createDetailService";
import {createReverseIndexRepository} from "./hooks/index-repository/createReverseIndexRespository";
import {createIdFieldRegister} from "./hooks/field-types/id-field/createIdFieldRegister";
import {createFieldExpressionParser} from "./hooks/expressions/field/createFieldExpressionParser";
import {createLogicExpressionParser} from "./hooks/expressions/logic/createLogicExpressionParser";
import {createPagerHook} from "./hooks/pager/createPagerHook";
import {RequestContext} from "./RequestContext";

export class Index<T extends Doc = Doc> {
    private readonly hookRegister: HookRegister;
    private readonly indexPath: string;

    constructor(dir: string) {
        this.indexPath = dir;
        this.hookRegister = new HookRegister();
    }

    async init(hookRegisterConsumers?: Array<HookRegisterConsumer>) {
        // 注册index.path，可能会被别人用到
        this.hookRegister.register({
            id: 'index.path',
            name: 'index.path',
            hook: this.indexPath,
        });
        // 1. 初始化默认的registerConsumer
        for (let consumer of Index.getDefaultHookRegisterConsumers()) {
            await consumer.init(this.hookRegister);
        }

        // 2. 初始化参数中的registerConsumer
        if (hookRegisterConsumers) {
            for (let consumer of hookRegisterConsumers) {
                await consumer.init(this.hookRegister);
            }
        }
    }

    private static getDefaultHookRegisterConsumers(): Array<HookRegisterConsumer> {
        return [
            createWhereParser(),
            createIdChecker(),
            createReverseIndexFactory(),
            createKVFactory(),
            createIdMapper(),
            createDetailService(),
            createReverseIndexRepository(),
            createIdFieldRegister(),
            createFieldExpressionParser(),
            createLogicExpressionParser(),
            createPagerHook(),
        ]
    }

    async jsonSearch(query: SearchReq): Promise<Array<T>> {

        // 0. 获取全量ids
        const indexRepositoryHook = this.hookRegister.getHook<ReverseIndexRepository>('reverse.index.repository');
        const fullIds = await indexRepositoryHook.hook.getBitset('inverted.full_id');

        const requestContext: RequestContext = {
            fullIds: fullIds,
        };

        // 1. 根据where条件进行过滤
        const hook = this.hookRegister.getHook<WhereParser>("where.parser");
        const bitset = await hook.hook.filter(query.where, requestContext);

        // 2. 获取pager
        const pagerHook = this.hookRegister.getHook<Pager>('pager');
        const ids = await pagerHook.hook.page(bitset, query?.page || {
            page: 0,
            pageSize: 20,
        });

        // 3. 获取详情服务
        const detailService = this.hookRegister.getHook<DetailService<T>>('detail.service');
        const promises = ids.map(async id => {
            return await detailService.hook.get(id);
        });
        const docs = await Promise.all(promises);
        return docs.filter(doc => doc != null)
            .map(doc => doc as T);
    }

    async get(docId: string): Promise<T | null> {
        // 5. id映射成整数
        const idMapper = this.hookRegister.getHook<IdMapper>("id.mapper");
        const numberId = await idMapper.hook.map('_id', docId);

        // 6. 获取详情服务
        const detailService = this.hookRegister.getHook<DetailService<T>>('detail.service');
        // 7. 写入详情
        return await detailService.hook.get(numberId);
    }

    async add(doc: T) {
        // check doc
        // 1. 检查id字段是否存在
        let docCheckerHooks = this.hookRegister.getHooks<DocChecker>("doc.checker");
        for (let hook of docCheckerHooks) {
            hook.hook.check(doc);
        }

        // 2. 获取IDField
        const id = doc._id;

        // 3. id映射成整数
        const idMapper = this.hookRegister.getHook<IdMapper>("id.mapper");
        const numberId = await idMapper.hook.map('_id', id);

        // 5. 获取详情服务
        const detailService = this.hookRegister.getHook<DetailService<T>>('detail.service');

        // 5. 获取老详情
        const oldDoc = await detailService.hook.get(numberId);
        // 4. 生成倒排的mutation
        const reverseMutationsFactory = this.hookRegister.getHook<ReverseMutationFactory<T>>('reverse.mutations.factory');
        const mutations = await reverseMutationsFactory.hook.processAdd(doc, numberId, oldDoc);

        // console.log(`mutations: ${JSON.stringify(mutations)}`);

        // 6. 写入详情
        await detailService.hook.set(numberId, doc);

        // 7. 写入倒排
        const reverseIndex = this.hookRegister.getHook<ReverseIndexRepository>('reverse.index.repository');
        for (let mutation of mutations) {
            await reverseIndex.hook.mutate(mutation);
        }
    }

    async delete(docId: string) {
        // 1. id映射成整数
        const idMapper = this.hookRegister.getHook<IdMapper>("id.mapper");
        const numberId = await idMapper.hook.map('_id', docId);

        // 2. 获取详情服务
        const detailService = this.hookRegister.getHook<DetailService<T>>('detail.service');
        // 3. 获取老的详情
        const doc = await detailService.hook.get(numberId);

        if (doc == null) {
            return;
        }

        // 4. 生成老的倒排
        const reverseMutationsFactory = this.hookRegister.getHook<ReverseMutationFactory<T>>('reverse.mutations.factory');
        const mutations = await reverseMutationsFactory.hook.processDelete(doc, numberId, true);

        console.log(`mutations: ${JSON.stringify(mutations)}`);

        // 5. 更新倒排
        const reverseIndex = this.hookRegister.getHook<ReverseIndexRepository>('reverse.index.repository');
        for (let mutation of mutations) {
            await reverseIndex.hook.mutate(mutation);
        }

        // 7. 删除详情
        await detailService.hook.del(numberId);
    }
}