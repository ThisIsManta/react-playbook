import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import _ from 'lodash'
import FuzzySearch from './FuzzySearch'

function classNames(...classes: Array<string | boolean | undefined | null>) {
	return classes.filter((item): item is string => typeof item === 'string').map(item => item.trim()).join(' ')
}

export interface IPlaybookPage {
	name: string
	content: React.ReactElement | { [caption: string]: React.ReactElement }
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

if (previewPathName && !document.title) {
	document.title = previewPathName
}

if (previewPathName && window.parent !== window.self) {
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
		const page = _.find(pages, page => page.name === previewPathName)

		if (!page) {
			return null
		}

		const elements = getElements(page.content)

		if (elements.length === 0) {
			return null
		}

		const index = parseInt(window.location.hash.replace(/^#/, '')) || 0
		const element = elements[index]

		if (!element) {
			return null
		}

		const ContentWrapper = props.contentWrapper || PassThroughContentWrapper

		return (
			<ErrorBoundary>
				<ContentWrapper>
					{element.element}
				</ContentWrapper>
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
	const getSelectPage = useCallback(() => _.find(props.pages, page => page.name === getQueryParams()['p']), [props.pages])
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
		if (selectPage) {
			document.title = selectPage.name
		}
	}, [selectPage])

	useEffect(() => {
		setQueryParams({ q: searchText }, true)
	}, [searchText])

	const searcher = useMemo(
		() => new FuzzySearch(props.pages, ['name'], { caseSensitive: false, sort: true }),
		[props.pages],
	)

	// Only for responsive view
	const [leftMenuVisible, setLeftMenuVisible] = useState(false)

	const [propertyPanelVisible, setPropertyPanelVisible] = useState(() => Boolean(window.sessionStorage.getItem('playbook__property-panel-visible') ?? 'true'))

	useEffect(() => {
		if (propertyPanelVisible) {
			window.sessionStorage.setItem('playbook__property-panel-visible', 'true')
		} else {
			window.sessionStorage.setItem('playbook__property-panel-visible', '')
		}
	}, [propertyPanelVisible])

	const onMenuItemClick = useCallback((pageName: string) => {
		setSelectPage(props.pages.find(page => page.name === pageName))
		setQueryParams({ p: pageName }, false)
		setLeftMenuVisible(false)
	}, [props.pages])

	const menus = useMemo(
		() => {
			const results = searcher.search(searchText)

			if (results.length === 0) {
				return (
					<div className='playbook__no-results'>
						<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px"><g><path d="M0,0h24v24H0V0z" fill="none" /></g><g><path d="M2.81,2.81L1.39,4.22l2.27,2.27C2.61,8.07,2,9.96,2,12c0,5.52,4.48,10,10,10c2.04,0,3.93-0.61,5.51-1.66l2.27,2.27 l1.41-1.41L2.81,2.81z M12,20c-4.41,0-8-3.59-8-8c0-1.48,0.41-2.86,1.12-4.06l10.94,10.94C14.86,19.59,13.48,20,12,20z M7.94,5.12 L6.49,3.66C8.07,2.61,9.96,2,12,2c5.52,0,10,4.48,10,10c0,2.04-0.61,3.93-1.66,5.51l-1.46-1.46C19.59,14.86,20,13.48,20,12 c0-4.41-3.59-8-8-8C10.52,4,9.14,4.41,7.94,5.12z" /></g></svg>
					</div>
				)
			}

			return results.map(page => (
				<MenuItemMemoized
					key={page.name}
					name={page.name}
					selected={page.name === selectPage?.name}
					onClick={onMenuItemClick}
				/>
			))
		},
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
				<div className='playbook__search-box'>
					<svg className='playbook__search-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
					<input
						type='text'
						value={searchText}
						placeholder='Search'
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
				</div>
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
					{typeof props.contentControl === 'function'
						? <props.contentControl />
						: props.contentControl}
					<div style={{ flex: '1 1 auto' }} />
					<Button
						title='Toggle dark mode'
						active={darkMode}
						onClick={() => {
							if (darkMode) {
								window.localStorage.removeItem('playbook__dark-mode')
							} else {
								window.localStorage.setItem('playbook__dark-mode', 'true')
							}

							window.location.reload()
						}}
					>
						<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><rect fill="none" height="24" width="24" /><path d="M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36c-0.98,1.37-2.58,2.26-4.4,2.26 c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z" /></svg>
					</Button>
					<Button
						id='playbook__property-panel-toggle'
						title='Toggle property panel'
						active={propertyPanelVisible}
						onClick={() => { setPropertyPanelVisible(value => !value) }}
					>
						<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" /></svg>
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
			{props.name.split(/\\|\//).map((part, rank, list) => (
				rank === list.length - 1
					? <span key={rank} className='playbook__menu__item__last'>{part}</span>
					: <span key={rank}>{part}/</span>
			))}
		</a>
	)
}

const ContentsMemoized = React.memo(Contents)

function Contents(props: {
	page: IPlaybookPage,
	propertyPanelVisible: boolean,
}) {
	const elements = getElements(props.page.content)

	if (elements.length === 0) {
		return (
			<div className='playbook__error'>
				Expected to render React elements, but found {_.isObjectLike(props.page.content) ? JSON.stringify(props.page.content) : String(props.page.content)}.
			</div>
		)
	}

	return (
		<React.Fragment>
			{elements.map(({ caption, element }, index) => (
				<Content
					key={props.page.name + '#' + index}
					link={'/' + window.encodeURI(props.page.name) + '#' + index}
					caption={caption}
					element={element}
					propertyPanelVisible={props.propertyPanelVisible}
				/>
			))}
		</React.Fragment>
	)
}

function PassThroughContentWrapper(props: { children: React.ReactElement }) {
	return props.children
}

const minimumPropertyPanelHeight = 45 // Represent total height of `playbook__property` with a single line text

function Content(props: {
	link: string
	caption: string | undefined,
	element: React.ReactElement,
	propertyPanelVisible: boolean,
}) {
	const propertyPanel = useRef<HTMLDivElement>(null)

	return (
		<div>
			{props.caption && <header className='playbook__content-caption'>
				<svg className='playbook__content-caption__icon' xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M685-128v-418H329l146 146-74 74-273-273 273-273 74 74-146 146h462v524H685Z" /></svg>
				{props.caption}
			</header>}
			<div className='playbook__content-container'>
				<div className='playbook__content-preview'>
					<iframe
						data-playbook-content={true}
						src={props.link}
						width='100%'
						height={minimumPropertyPanelHeight + 'px'}
						frameBorder='0'
						scrolling='no'
						onLoad={(e) => {
							const w = e.currentTarget.contentWindow
							if (w) {
								const actualContentHeight = w.document.body.clientHeight

								const expectedFrameHeight = actualContentHeight <= 40
									? Math.round(window.innerHeight * 0.8)
									: w.document.documentElement.scrollHeight

								const propertyPanelHeight = propertyPanel.current?.clientHeight ?? 0

								e.currentTarget.style.height = Math.max(expectedFrameHeight, propertyPanelHeight) + 'px'

								e.currentTarget.setAttribute('scrolling', 'auto')
							}
						}}
					/>
					<Button
						id='playbook__new-window'
						title='Open in a new tab'
						onClick={() => { window.open(props.link, '_blank') }}
					>
						<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><rect fill="none" height="24" width="24" /><polygon points="21,11 21,3 13,3 16.29,6.29 6.29,16.29 3,13 3,21 11,21 7.71,17.71 17.71,7.71" /></svg>
					</Button>
				</div>
				<div
					className={classNames(
						'playbook__property',
						!props.propertyPanelVisible && 'playbook__property__hidden',
					)}
					ref={propertyPanel}
					dangerouslySetInnerHTML={{ __html: getNodeHTML(props.element) }}
				/>
			</div>
		</div>
	)
}

function Button({ active, ...props }: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & { active?: boolean }) {
	return (
		<button
			{...props}
			className={classNames('playbook__button', active && 'playbook__button__active', props.className)}
		/>
	)
}

export function getElements(content: IPlaybookPage['content']): Array<{ caption?: string, element: React.ReactElement }> {
	if (_.isArray(content)) {
		return Δ(content)
	}

	if (React.isValidElement(content)) {
		if (content.type === React.Fragment) {
			const fragment = content as React.ReactElement<{ children: React.ReactNode | React.ReactNodeArray }>
			if (_.isArray(fragment.props.children)) {
				return Δ(fragment.props.children)
			} else {
				return Δ([fragment.props.children])
			}
		}

		return [{ element: content }]
	}

	if (_.isPlainObject(content)) {
		return _.toPairs(content)
			.filter(([, element]) => React.isValidElement(element))
			.map(([caption, element]) => ({ caption, element }))
	}

	return []
}

function Δ(elements: React.ReactNodeArray) {
	return elements.filter(React.isValidElement).map(element => ({ element }))
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
			outerHTML += _.escape('>') + '<div class="playbook__property__indent">' + innerHTML + '</div>' + _.escape('</') + tagName + _.escape('>')
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
			'^' + (_.chain(list)
				.map(line => line.replace(/\t/g, '  ').match(/^\s+/))
				.compact()
				.map(([match]) => match)
				.minBy(match => match.length)
				.value() || ''),
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
