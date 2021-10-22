export default function flattenObject(glob, test) {
    return flattenObjectInternal(glob, test, [], []);
}
function flattenObjectInternal(hash, test, keys, memo) {
    if (test(hash)) {
        memo.push({
            keys,
            value: hash,
        });
    }
    else if (typeof hash === 'object' && hash !== null) {
        for (const key of Object.getOwnPropertyNames(hash)) {
            flattenObjectInternal(hash[key], test, [...keys, key], memo);
        }
    }
    return memo;
}
