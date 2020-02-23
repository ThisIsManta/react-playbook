export default function flattenObject<T = any>(glob: {
    [key: string]: any;
}, test: (hash: any) => hash is T): {
    keys: string[];
    value: T;
}[];
