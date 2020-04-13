import {Field} from "../Field";

export interface FieldProvider {
    provider(name: string, value: any): Field
}