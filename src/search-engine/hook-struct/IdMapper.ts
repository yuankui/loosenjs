export interface IdMapper {
    map(namespace: string, source: string): Promise<number>;
    get(namespace: string, source: string): Promise<number | null>;
}