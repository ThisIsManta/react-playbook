"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var FuzzySearch = (function () {
    function FuzzySearch(haystack, keys, options) {
        if (haystack === void 0) { haystack = []; }
        if (keys === void 0) { keys = []; }
        if (options === void 0) { options = {}; }
        this.haystack = haystack;
        this.keys = keys;
        this.options = lodash_1.default.assign({
            caseSensitive: false,
            sort: false,
        }, options);
    }
    FuzzySearch.prototype.search = function (query) {
        var e_1, _a, e_2, _b;
        if (query === void 0) { query = ''; }
        query = lodash_1.default.trim(query);
        if (!this.options.caseSensitive) {
            query = lodash_1.default.toLower(query);
        }
        if (query === '') {
            return this.haystack;
        }
        var results = [];
        try {
            for (var _c = __values(this.haystack), _d = _c.next(); !_d.done; _d = _c.next()) {
                var item = _d.value;
                if (this.keys.length === 0) {
                    var score = this.isMatch(String(item), query);
                    if (score) {
                        results.push({ item: item, score: score });
                    }
                }
                else {
                    try {
                        for (var _e = (e_2 = void 0, __values(this.keys)), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var key = _f.value;
                            var score = this.isMatch(String(lodash_1.default.get(item, key)), query);
                            if (score) {
                                results.push({ item: item, score: score });
                                break;
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (this.options.sort) {
            results.sort(function (a, b) { return a.score - b.score; });
        }
        return results.map(function (result) { return result.item; });
    };
    FuzzySearch.prototype.isMatch = function (item, query) {
        if (!this.options.caseSensitive) {
            item = item.toLocaleLowerCase();
        }
        var indexes = this.nearestIndexesFor(item, query);
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
    };
    FuzzySearch.prototype.nearestIndexesFor = function (item, query) {
        var letters = query.split('');
        var indexes = this.indexesOfFirstLetter(item, query)
            .map(function (startingIndex) {
            var index = startingIndex + 1;
            var results = [startingIndex];
            for (var i = 1; i < letters.length; i++) {
                var letter = letters[i];
                index = item.indexOf(letter, index);
                if (index === -1) {
                    return [];
                }
                results.push(index);
                index++;
            }
            return results;
        })
            .filter(function (letterIndexes) { return letterIndexes.length > 0; });
        if (indexes.length === 0) {
            return false;
        }
        return indexes.sort(function (a, b) {
            if (a.length === 1) {
                return a[0] - b[0];
            }
            return (a[a.length - 1] - a[0]) - (b[b.length - 1] - b[0]);
        })[0];
    };
    FuzzySearch.prototype.indexesOfFirstLetter = function (item, query) {
        var match = query[0];
        return item.split('')
            .map(function (letter, index) {
            if (letter !== match) {
                return null;
            }
            return index;
        })
            .filter(function (index) { return typeof index === 'number'; });
    };
    return FuzzySearch;
}());
exports.default = FuzzySearch;
