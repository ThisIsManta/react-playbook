import React, { useState, useMemo, useEffect } from 'react'
import _ from 'lodash'

function classNames(...classes: Array<any>) {
	return _.compact(classes).join(' ')
}

export interface IPlaybookPage {
	name: string
	content: React.ReactFragment
}

type Props = {
	toolbar?: React.ReactNode
	pages: Array<IPlaybookPage>
}

export default React.memo((props: Props) => {
	const pages = useMemo(
		() => _.chain(props.pages)
			.uniqBy(page => page.name)
			.sortBy(page => page.name)
			.value(),
		[props.pages],
	)

	const path = window.decodeURI(window.location.pathname.replace(/^\//, ''))
	if (path !== '') {
		const page = pages.find(page => page.name === path)

		if (!page) {
			return null
		}

		const elements = getReactChildren(page.content)

		if (elements.length === 0) {
			return null
		}

		const index = window.location.hash.replace(/^#/, '')
		const element = elements[index]

		if (!element) {
			return null
		}

		return (
			<ErrorBoundary>
				{element}
			</ErrorBoundary>
		)
	}

	return (
		<ErrorBoundary>
			<Playbook {...props} />
		</ErrorBoundary>
	)
})

function Playbook(props: Props) {
	const [selectPage, setSelectPage] = useState(() => props.pages.find(page => page.name === getQueryParams()['p']))

	useEffect(() => {
		setQueryParams({ p: selectPage?.name }, false)
	}, [selectPage])

	const [searchText, setSearchText] = useState(() => getQueryParams()['q'] || '')

	useEffect(() => {
		setQueryParams({ q: searchText }, true)
	}, [searchText])

	const searchPatterns = useMemo(
		() => _.words(searchText)
			.map(word => new RegExp(_.escapeRegExp(word), 'i')),
		[searchText],
	)

	const menus = useMemo(
		() => props.pages
			.filter(page => searchPatterns.length === 0 || searchPatterns.every(pattern => pattern.test(page.name)))
			.map(page => {
				const link = '?p=' + window.encodeURI(page.name)

				return (
					<a
						key={page.name}
						className={classNames(
							'playbook__menu__item',
							page === selectPage && '--select',
						)}
						href={link}
						onClick={e => {
							// Avoid re-rendering the whole page for performance while allow users to copy the links
							e.preventDefault()
							setSelectPage(page)
						}}
					>
						{page.name.split('/').map((part, rank, list) => (
							rank === list.length - 1
								? <span key={rank} className='playbook__menu__item__last'>{part}</span>
								: <span key={rank}>{part}/</span>
						))}
					</a>
				)
			}),
		[props.pages, selectPage, searchPatterns],
	)

	return (
		<div className='playbook'>
			<link href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,600&family=Roboto+Mono:400,600&display=swap' rel='stylesheet' />
			<div className='playbook__left'>
				<input
					className='playbook__search-box'
					type='text'
					placeholder='Search here'
					value={searchText}
					onChange={e => {
						setSearchText(e.target.value)
					}}
					onKeyUp={e => {
						if (e.key === 'Escape') {
							setSearchText('')
						}
					}}
				/>
				<div className='playbook__menu'>
					{menus}
				</div>
			</div>
			<div className='playbook__right'>
				<div className='playbook__toolbar'>
					{props.toolbar}
				</div>
				<div className='playbook__contents'>
					{selectPage && <Contents page={selectPage} />}
				</div>
			</div>
		</div>
	)
}

function Contents(props: { page: IPlaybookPage }) {
	const elements = getReactChildren(props.page.content)

	if (elements.length === 0) {
		return (
			<div className='playbook__error'>
				Expected to render React elements, but found {JSON.stringify(props.page.content)}.
			</div>
		)
	}

	return (
		<React.Fragment>
			{elements.map((element, index) => (
				<section key={props.page.name + '#' + index} className='playbook__content'>
					<iframe
						className='playbook__preview'
						src={'/' + window.encodeURI(props.page.name) + '#' + index}
						width='100%'
						frameBorder='0'
						scrolling='no'
						onLoad={(e) => {
							if (e.currentTarget.contentWindow) {
								e.currentTarget.style.height = e.currentTarget.contentWindow.document.documentElement.scrollHeight + 'px';
							}
						}}
					/>
					<div className='playbook__property' dangerouslySetInnerHTML={{ __html: getNodeHTML(element) }} />
				</section>
			))}
		</React.Fragment>
	)
}

export function getReactChildren(element: React.ReactFragment): Array<React.ReactElement> {
	if (_.isArray(element)) {
		return Δ(element)
	}

	if (React.isValidElement(element)) {
		if (element.type === React.Fragment) {
			const fragment = element as React.ReactElement<{ children: React.ReactNode | React.ReactNodeArray }>
			if (_.isArray(fragment.props.children)) {
				return Δ(fragment.props.children)
			} else {
				return Δ([fragment.props.children])
			}
		}

		return [element]
	}

	return []
}

function Δ(elements: React.ReactNodeArray) {
	return elements.filter(React.isValidElement)
}

// TODO: convert this to a React component
function getNodeHTML(node: React.ReactNode): string {
	if (!node || node === true) {
		return ''
	}

	if (typeof node === 'string' || typeof node === 'number') {
		return _.escape(String(node))
	}

	if (Array.isArray(node)) {
		return node.map(getNodeHTML).join('')
	}

	if (React.isValidElement(node)) {
		const tagName = `<span class="playbook__property__tag">${_.escape(getTagName(node))}</span>`
		const { children, ...attributes } = node.props

		let outerHTML = _.escape('<') + tagName

		outerHTML += _.map(attributes, (value, name) => {
			const openingQuote = typeof value === 'string' ? '' : '{'
			const closingQuote = typeof value === 'string' ? '' : '}'
			return (
				`<div class="playbook__property__indent">${_.escape(name)}=${openingQuote}${getPropValueHTML(value, 'html')}${closingQuote}</div>`
			)
		}).join('')

		const innerHTML = getNodeHTML(children)

		if (innerHTML) {
			outerHTML += _.escape('>') + innerHTML + _.escape('</') + tagName + _.escape('>')
		} else {
			outerHTML += _.escape('/>')
		}

		return '<div class="playbook__property__indent">' + outerHTML + '</div>'
	}

	console.warn('Found an unrecognized node type:', node)
	return ''
}

function getTagName(element: React.ReactElement): string {
	if (element.type === React.Fragment) {
		return 'Fragment'
	}

	if (typeof element.type === 'string') {
		return element.type
	}

	return (
		_.get(element, 'type.displayName') ||
		_.get(element, 'type.name') ||
		_.get(element, 'type.constructor.name') ||
		'Untitled'
	)
}

function getPropValueHTML(value: any, mode: 'html' | 'text'): string {
	const lineFeed = mode === 'html' ? '<br/>' : '\n'
	const addIndent = (text: string) => {
		if (mode === 'html') {
			return '<div class="playbook__property__indent">' + text + '</div>'
		}

		return '\n' + text.split(/\r?\n/).map(line => '  ' + line).join('\n') + '\n'
	}

	if (React.isValidElement(value)) {
		return getNodeHTML(value)
	}

	if (_.isFunction(value)) {
		if (mode === 'text') {
			return 'Function'
		}

		const list = String(value).split(/\r?\n/)
		const indent = new RegExp(
			'^' + _.chain(list)
				.map(line => line.replace(/\t/g, '  ').match(/^\s+/))
				.compact()
				.map(([match]) => match)
				.minBy(match => match.length)
				.value() ?? '',
		)
		const text = list.map(line => line.replace(indent, '')).join('\n')

		return '<span class="playbook__property__function" title="' +
			_.escape(text) +
			'">Function</span>'
	}

	if (_.isArray(value)) {
		const list: Array<string> = []
		let lastRank = 0
		let textLong = 0
		for (; lastRank < value.length; lastRank++) {
			const text = getPropValueHTML(value[lastRank], mode)
			if (textLong + text.length > 240 && mode === 'html') {
				break
			}
			list.push(text)
			textLong += text.length
		}

		if (list.length < value.length) {
			const hint: Array<string> = []
			for (; lastRank < value.length; lastRank++) {
				const text = getPropValueHTML(value[lastRank], 'text')
				hint.push(text)
			}
			list.push('<span title="' + hint.join(',\n') + '">...</span>')
		}

		const wrap = list.length > 1 || textLong > 120 ? addIndent : _.identity
		return '[' + wrap(list.join(',' + lineFeed)) + ']'
	}

	if (_.isObject(value)) {
		const list: Array<string> = []
		let lastRank = 0
		let textLong = 0
		const pairs = _.toPairs(value)
		for (; lastRank < pairs.length; lastRank++) {
			const [k, v] = pairs[lastRank]
			const text = _.escape(k) + ': ' + getPropValueHTML(v, mode)
			if (textLong + text.length > 240 && mode === 'html') {
				break
			}
			list.push(text)
			textLong += text.length
		}

		if (list.length < _.size(value)) {
			const hint: Array<string> = []
			for (; lastRank < pairs.length; lastRank++) {
				const [k, v] = pairs[lastRank]
				const text = _.escape(k) + ': ' + getPropValueHTML(v, 'text')
				hint.push(text)
			}
			list.push('<span title="' + hint.join('\n') + '">...</span>')
		}

		const wrap = list.length > 1 || textLong > 120 ? addIndent : _.identity
		return '{ ' + wrap(list.join(',' + lineFeed)) + ' }'
	}

	return _.escape(JSON.stringify(value, null, ''))
}

class ErrorBoundary extends React.PureComponent<{ children: React.ReactNode }, { error?: any }> {
	constructor(props) {
		super(props)

		this.state = {}
	}

	static getDerivedStateFromError(error) {
		return { error }
	}

	render() {
		if (this.state.error) {
			return (
				<div className='playbook__error'>
					{String(this.state.error)}
				</div>
			)
		}

		return this.props.children
	}
}

function getQueryParams(): { [key: string]: string } {
	return _.chain(window.location.search.replace(/^\?/, ''))
		.split('&')
		.map(part => {
			const [key, value] = part.split('=')
			return [key, window.decodeURIComponent(value) ?? '']
		})
		.fromPairs()
		.value()
}

function setQueryParams(params: { [key: string]: string | undefined }, replace: boolean) {
	const link = '?' +
		_.chain({ ...getQueryParams(), ...params })
			.toPairs()
			.filter((pair): pair is [string, string] => !!pair[1])
			.map(([key, value]) => key + '=' + window.encodeURIComponent(value))
			.value()
			.join('&')

	if (replace) {
		window.history.replaceState(null, '', link)
	} else {
		window.history.pushState(null, '', link)
	}
}
