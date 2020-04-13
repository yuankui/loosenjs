export interface IndexSchema {
    fields: Array<FieldSchema>,
}

export interface FieldSchema {
    name: string,
    type: string | 'int' | 'text' | 'boolean',
    config?: any,
}