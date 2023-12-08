export default class FuzzySearch<T> {
    private haystack;
    keys: Array<string>;
    options: {
        caseSensitive: boolean;
        sort: boolean;
    };
    constructor(haystack?: Array<T>, keys?: Array<string>, options?: Partial<{
        caseSensitive: boolean;
        sort: boolean;
    }>);
    search(query?: string): Array<T>;
    isMatch(item: string, query: string): number | false;
    nearestIndexesFor(item: string, query: string): false | number[];
    indexesOfFirstLetter(item: string, query: string): number[];
}
