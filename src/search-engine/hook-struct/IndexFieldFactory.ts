import {Field} from "./Field";

/**
 * 用来根据字段的值，新建字段的元数据的
 */
export interface IndexFieldFactory {
    fromConfig(name: string, type: string, config: any): Field | null;
}