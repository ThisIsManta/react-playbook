// Heavily modified from https://github.com/wouter2203/fuzzy-search/tree/57188a0498ee21d45462c1560795a31d2282cf64/src

/*
Copyright (c) 2016, Wouter Rutgers

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

import _ from 'lodash'

export default class FuzzySearch<T> {
	public options: {
		caseSensitive: boolean
		sort: boolean
	}

	constructor(
		private haystack: Array<T> = [],
		public keys: Array<string> = [],
		options: Partial<{ caseSensitive: boolean, sort: boolean }> = {}
	) {
		this.options = _.assign({
			caseSensitive: false,
			sort: false,
		}, options)
	}

	search(query = ''): Array<T> {
		query = _.trim(query)

		if (!this.options.caseSensitive) {
			query = _.toLower(query)
		}

		if (query === '') {
			return this.haystack
		}

		const results: Array<{ item: T, score: number }> = []

		for (const item of this.haystack) {
			if (this.keys.length === 0) {
				const score = this.isMatch(String(item as any), query)
				if (score) {
					results.push({ item, score })
				}

			} else {
				for (const key of this.keys) {
					const score = this.isMatch(String(_.get(item, key)), query)
					if (score) {
						results.push({ item, score })

						break
					}
				}
			}
		}

		if (this.options.sort) {
			results.sort((a, b) => a.score - b.score)
		}

		return results.map(result => result.item)
	}

	isMatch(item: string, query: string): number | false {
		if (!this.options.caseSensitive) {
			item = item.toLocaleLowerCase()
		}

		const indexes = this.nearestIndexesFor(item, query)

		if (indexes === false) {
			return false
		}

		// Exact matches should be first.
		if (item === query) {
			return 1
		}

		// If we have more than 2 letters, matches close to each other should be first.
		if (indexes.length > 1) {
			return 2 + (indexes[indexes.length - 1] - indexes[0])
		}

		// Matches closest to the start of the string should be first.
		return 2 + indexes[0]
	}

	nearestIndexesFor(item: string, query: string) {
		const letters = query.split('')

		const indexes = this.indexesOfFirstLetter(item, query)
			.map((startingIndex) => {
				let index = startingIndex + 1

				const results = [startingIndex]

				for (let i = 1; i < letters.length; i++) {
					const letter = letters[i]

					index = item.indexOf(letter, index)

					if (index === -1) {
						return []
					}

					results.push(index)

					index++
				}

				return results
			})
			.filter(letterIndexes => letterIndexes.length > 0)

		if (indexes.length === 0) {
			return false
		}

		return indexes.sort((a, b) => {
			if (a.length === 1) {
				return a[0] - b[0]
			}

			return (a[a.length - 1] - a[0]) - (b[b.length - 1] - b[0])
		})[0]
	}

	indexesOfFirstLetter(item: string, query: string) {
		const match = query[0]

		return item.split('')
			.map((letter, index) => {
				if (letter !== match) {
					return null
				}

				return index
			})
			.filter((index): index is number => typeof index === 'number')
	}
}
