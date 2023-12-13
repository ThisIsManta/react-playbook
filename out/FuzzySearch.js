import get from 'lodash/get';
export default class FuzzySearch {
    constructor(haystack = [], keys = [], options = {}) {
        this.haystack = haystack;
        this.keys = keys;
        this.options = Object.assign({
            caseSensitive: false,
            sort: false,
        }, options);
    }
    search(query = '') {
        query = query.trim();
        if (!this.options.caseSensitive) {
            query = query.toLocaleLowerCase();
        }
        if (query === '') {
            return this.haystack;
        }
        const results = [];
        for (const item of this.haystack) {
            if (this.keys.length === 0) {
                const score = this.isMatch(String(item), query);
                if (score) {
                    results.push({ item, score });
                }
            }
            else {
                for (const key of this.keys) {
                    const score = this.isMatch(String(get(item, key)), query);
                    if (score) {
                        results.push({ item, score });
                        break;
                    }
                }
            }
        }
        if (this.options.sort) {
            results.sort((a, b) => a.score - b.score);
        }
        return results.map(result => result.item);
    }
    isMatch(item, query) {
        if (!this.options.caseSensitive) {
            item = item.toLocaleLowerCase();
        }
        const indexes = this.nearestIndexesFor(item, query);
        if (indexes === false) {
            return false;
        }
        if (item === query) {
            return 1;
        }
        if (indexes.length > 1) {
            return 2 + (indexes[indexes.length - 1] - indexes[0]);
        }
        return 2 + indexes[0];
    }
    nearestIndexesFor(item, query) {
        const letters = query.split('');
        const indexes = this.indexesOfFirstLetter(item, query)
            .map((startingIndex) => {
            let index = startingIndex + 1;
            const results = [startingIndex];
            for (let i = 1; i < letters.length; i++) {
                const letter = letters[i];
                index = item.indexOf(letter, index);
                if (index === -1) {
                    return [];
                }
                results.push(index);
                index++;
            }
            return results;
        })
            .filter(letterIndexes => letterIndexes.length > 0);
        if (indexes.length === 0) {
            return false;
        }
        return indexes.sort((a, b) => {
            if (a.length === 1) {
                return a[0] - b[0];
            }
            return (a[a.length - 1] - a[0]) - (b[b.length - 1] - b[0]);
        })[0];
    }
    indexesOfFirstLetter(item, query) {
        const match = query[0];
        return item.split('')
            .map((letter, index) => {
            if (letter !== match) {
                return null;
            }
            return index;
        })
            .filter((index) => typeof index === 'number');
    }
}
