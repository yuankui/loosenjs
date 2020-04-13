import {IndexSchema} from "../Schema";
import {TextField} from "./field-types/text-type/TextField";
import {IntegerField} from "./field-types/int-type/IntegerField";
import {BooleanField} from "./field-types/boolean-type/BooleanField";
import {Field} from "../hook-struct/Field";
import {HookRegisterConsumer} from "../HookRegisterConsumer";
import {HookRegister} from "../HookRegister";

const TypeMap: { [key: string]: new (name: string, config: any) => Field; } = {
    'text': TextField,
    'int': IntegerField,
    'boolean': BooleanField,
};

export function createFieldRegister(schema: IndexSchema) : HookRegisterConsumer {
    return {
        name: "Schema",
        async init(hookRegister: HookRegister): Promise<any> {
            for (let field of schema.fields) {
                const FieldType = TypeMap[field.type];
                const f = new FieldType(field.name, field.config);
                hookRegister.register<Field>({
                    id: `field.${field.name}`,
                    name: "index.field",
                    hook: f,
                });
            }
        }
    }
}