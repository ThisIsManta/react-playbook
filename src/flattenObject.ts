export default function flattenObject<T = any>(
	glob: { [key: string]: any },
	test: (hash: any) => hash is T,
) {
	return flattenObjectInternal<T>(glob, test, [], [])
}

function flattenObjectInternal<T>(
	hash: unknown,
	test: (hash: any) => hash is T,
	keys: Array<string>,
	memo: Array<{ keys: Array<string>, value: T }>,
) {
	if (test(hash)) {
		memo.push({
			keys,
			value: hash,
		})
	} else if (typeof hash === 'object' && hash !== null) {
		for (const key of Object.getOwnPropertyNames(hash)) {
			flattenObjectInternal(hash[key], test, [...keys, key], memo)
		}
	}
	return memo
}
