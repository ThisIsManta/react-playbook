import React, { useState, useMemo, useEffect, useCallback } from 'react'
import _ from 'lodash'
import FuzzySearch from 'fuzzy-search'

function classNames(...classes: Array<any>) {
	return _.compact(classes).join(' ')
}

export interface IPlaybookPage {
	name: string
	content: React.ReactFragment
}

type Props = {
	pages: Array<IPlaybookPage>
	contentControl?: React.ComponentType | React.ReactElement
	contentWrapper?: React.ComponentType<{ children: React.ReactElement }>
}

interface IPlaybook {
	(props: Props): React.ReactElement | null
	Button: typeof Button
}

const previewPathName = window.decodeURI(window.location.pathname.replace(/^\//, ''))

if (previewPathName) {
	document.body.classList.add('playbook__preview')
}

const darkMode = window.localStorage.getItem('playbook__dark-mode') === 'true'
if (darkMode) {
	document.body.classList.add('playbook__dark-mode')
}

const Playbook: IPlaybook = function Playbook(props: Props) {
	const pages = useMemo(
		() => _.chain(props.pages)
			.uniqBy(page => page.name)
			.sortBy(page => page.name)
			.value(),
		[props.pages],
	)

	if (previewPathName) {
		const page = pages.find(page => page.name === previewPathName)

		if (!page) {
			return null
		}

		const elements = getReactChildren(page.content)

		if (elements.length === 0) {
			return null
		}

		const index = window.location.hash.replace(/^#/, '') || '0'
		const element = elements[index]

		if (!element) {
			return null
		}

		return (
			<ErrorBoundary>
				{props.contentWrapper
					? <props.contentWrapper>{element}</props.contentWrapper>
					: element
				}
			</ErrorBoundary>
		)
	}

	return (
		<ErrorBoundary>
			<Index {...props} pages={pages} />
		</ErrorBoundary>
	)
}

Playbook.Button = Button

function Index(props: Props) {
	const getSelectPage = useCallback(() => props.pages.find(page => page.name === getQueryParams()['p']), [props.pages])
	const getSearchText = useCallback(() => getQueryParams()['q'] || '', [])

	const [selectPage, setSelectPage] = useState(getSelectPage)
	const [searchText, setSearchText] = useState(getSearchText)

	useEffect(() => {
		const firstPage = props.pages[0]
		if (selectPage === undefined && firstPage) {
			setQueryParams({ p: firstPage.name }, true)
			setSelectPage(firstPage)
		}
	}, [props.pages])

	useEffect(() => {
		window.addEventListener('popstate', () => {
			setSelectPage(getSelectPage())
			setSearchText(getSearchText())
		})
	}, [])

	useEffect(() => {
		setQueryParams({ q: searchText }, true)
	}, [searchText])

	const searcher = useMemo(
		() => new FuzzySearch(props.pages, ['name'], { caseSensitive: false, sort: true }),
		[props.pages],
	)

	// Only for responsive view
	const [leftMenuVisible, setLeftMenuVisible] = useState(false)

	const [propertyPanelVisible, setPropertyPanelVisible] = useState(true)

	const onMenuItemClick = useCallback((pageName: string) => {
		setSelectPage(props.pages.find(page => page.name === pageName))
		setQueryParams({ p: pageName }, false)
		setLeftMenuVisible(false)
	}, [props.pages])

	const menus = useMemo(
		() => searcher.search(searchText).map(page => (
			<MenuItemMemoized
				name={page.name}
				selected={page.name === selectPage?.name}
				onClick={onMenuItemClick}
			/>
		)),
		[searcher, searchText, selectPage],
	)

	return (
		<div className='playbook'>
			<link href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,600&family=Roboto+Mono:400,600&display=swap' rel='stylesheet' />
			<div
				className={classNames(
					'playbook__left',
					leftMenuVisible && 'playbook__left-responsive',
				)}
				tabIndex={-1}
				onKeyUp={e => {
					if (e.key === 'Escape') {
						setLeftMenuVisible(false)
					}
				}}
			>
				<input
					className='playbook__search-box'
					type='text'
					placeholder='Search here'
					value={searchText}
					onChange={e => {
						setSearchText(e.target.value)
					}}
					onKeyUp={e => {
						if (e.key === 'Escape' && searchText !== '') {
							setSearchText('')
							e.stopPropagation()
						}
					}}
				/>
				<div className='playbook__menu'>
					{menus}
				</div>
			</div>
			<div className='playbook__right'>
				<div className='playbook__toolbar'>
					<Button
						id='playbook__side-menu-toggle'
						title='Open navigation menu'
						onClick={() => { setLeftMenuVisible(value => !value) }}
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path d="M0 0h24v24H0z" fill="none" />
							<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
						</svg>
					</Button>
					{React.isValidElement(props.contentControl) || !props.contentControl
						? props.contentControl
						: <props.contentControl />}
					<div style={{ flex: '1 1 auto' }} />
					<Button
						title='Toggle dark mode'
						onClick={() => {
							if (darkMode) {
								window.localStorage.removeItem('playbook__dark-mode')
							} else {
								window.localStorage.setItem('playbook__dark-mode', 'true')
							}

							window.location.reload()
						}}
					>
						{darkMode
							? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ><path d="M0 0h24v24H0z" fill="none" /><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" /></svg>
							: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path d="M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z" /></svg>
						}
					</Button>
					<Button
						id='playbook__property-panel-toggle'
						title={propertyPanelVisible ? 'Hide property panel' : 'Show property panel'}
						onClick={() => { setPropertyPanelVisible(value => !value) }}
					>
						{propertyPanelVisible
							? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" /></svg>
							: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path d="M23 21.74l-1.46-1.46L7.21 5.95 3.25 1.99 1.99 3.25l2.7 2.7h-.64c-1.11 0-1.99.89-1.99 2l-.01 11c0 1.11.89 2 2 2h15.64L21.74 23 23 21.74zM22 7.95c.05-1.11-.84-2-1.95-1.95h-4V3.95c0-1.11-.89-2-2-1.95h-4c-1.11-.05-2 .84-2 1.95v.32l13.95 14V7.95zM14.05 6H10V3.95h4.05V6z" /></svg>}
					</Button>
				</div>
				<div className='playbook__contents'>
					{selectPage && (
						<ContentsMemoized
							page={selectPage}
							propertyPanelVisible={propertyPanelVisible}
						/>
					)}
				</div>
			</div>
		</div>
	)
}

const MenuItemMemoized = React.memo(MenuItem)

function MenuItem(props: { name: string, selected: boolean, onClick: (name: string) => void }) {
	return (
		<a
			className={classNames(
				'playbook__menu__item',
				props.selected && '--select',
			)}
			href={'?p=' + window.encodeURI(props.name)}
			onClick={e => {
				// Avoid re-rendering the whole page for performance while allow users to copy the links
				e.preventDefault()
				props.onClick(props.name)
			}}
		>
			{props.name.split('/').map((part, rank, list) => (
				rank === list.length - 1
					? <span key={rank} className='playbook__menu__item__last'>{part}</span>
					: <span key={rank}>{part}/</span>
			))}
		</a>
	)
}

const ContentsMemoized = React.memo(Contents)

function Contents(props: { page: IPlaybookPage, propertyPanelVisible: boolean }) {
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
			{elements.map((element, index) => {
				const link = '/' + window.encodeURI(props.page.name) + '#' + index

				return (
					<section key={props.page.name + '#' + index} className='playbook__content'>
						<div className='playbook__content-container'>
							<iframe
								data-playbook-content={true}
								src={link}
								width='100%'
								frameBorder='0'
								scrolling='no'
								onLoad={(e) => {
									if (e.currentTarget.contentWindow) {
										e.currentTarget.style.height = e.currentTarget.contentWindow.document.documentElement.scrollHeight + 'px';
									}
								}}
							/>
							<Button
								id='playbook__new-window'
								title='Open in a new tab'
								onClick={() => { window.open(link, '_blank') }}
							>
								<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24">
									<rect fill="none" height="24" width="24" />
									<path d="M9,5v2h6.59L4,18.59L5.41,20L17,8.41V15h2V5H9z" />
								</svg>
							</Button>
						</div>
						{props.propertyPanelVisible && (
							<div className='playbook__property' dangerouslySetInnerHTML={{ __html: getNodeHTML(element) }} />
						)}
					</section>
				)
			})}
		</React.Fragment>
	)
}

function Button(props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) {
	return <button className='playbook__button' {...props} />
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
		.compact()
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

export default Playbook
