import React, { useState, useMemo, useEffect, useCallback, useLayoutEffect } from 'react'
import compact from 'lodash/compact'
import uniqBy from 'lodash/uniqBy'
import sortBy from 'lodash/sortBy'
import FuzzySearch from './FuzzySearch'

import './Playbook.css'

function classNames(...classes: Array<string | boolean | undefined | null>) {
	return classes.filter((item): item is string => typeof item === 'string').map(item => item.trim()).join(' ')
}

export interface IPlaybookPage {
	name: string
	content: () => React.ReactElement
}

type Props<T extends IPlaybookPage> = {
	pages: Array<T>
	contentControl?: React.ComponentType<{ currentPage?: T }>
	contentWrapper?: React.ComponentType<{ currentPage: T; children: React.ReactElement }>
}

interface IPlaybook {
	<T extends IPlaybookPage>(props: Props<T>): React.ReactElement | null
	Button: typeof Button
}

const previewPageName = getQueryParams().r

if (!previewPageName) {
	document.body.classList.add('playbook__theater')

} else {
	if (!document.title) {
		document.title = previewPageName
	}

	if (window.parent !== window.self) {
		document.body.classList.add('playbook__preview')
	}
}

const darkMode = window.localStorage.getItem('playbook__dark-mode') === 'true'
if (darkMode) {
	document.body.classList.add('playbook__dark-mode')
}

const Playbook: IPlaybook = function Playbook(props) {
	const pages = useMemo(
		() => sortBy(
			uniqBy(props.pages, page => page.name),
			page => page.name),
		[props.pages],
	)

	if (previewPageName) {
		const page = pages.find(page => page.name === previewPageName)

		if (!page || typeof page.content !== 'function') {
			// TODO: show not-found page
			return null
		}

		const Content = page.content
		const ContentWrapper = props.contentWrapper || PassThroughContentWrapper

		return (
			<ErrorBoundary>
				<ContentWrapper currentPage={page}>
					<React.Suspense>
						<Content />
					</React.Suspense>
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

function Index<T extends IPlaybookPage>(props: Props<T>) {
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
		if (selectPage) {
			document.title = selectPage.name
		}
	}, [selectPage])

	useEffect(() => {
		setQueryParams({ q: searchText }, true)
	}, [searchText])

	useLayoutEffect(() => {
		document.querySelector('.playbook__menu__item.--select')?.scrollIntoView({ block: 'center' })
	}, [])

	const searcher = useMemo(
		() => new FuzzySearch(props.pages, ['name'], { caseSensitive: false, sort: true }),
		[props.pages],
	)

	// Only for responsive view
	const [leftMenuVisible, setLeftMenuVisible] = useState(false)

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

	const selectLink = selectPage ? './?r=' + window.encodeURIComponent(selectPage.name) : null

	return (
		<div className='playbook'>
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
			<link href="https://fonts.googleapis.com/css2?family=Roboto+Mono&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet" />
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
				<div
					className='playbook__menu'
					onScroll={(e) => {
						if (e.currentTarget.scrollTop === 0) {
							window.sessionStorage.removeItem('playbook__menu-scroll-top')
						} else {
							window.sessionStorage.setItem('playbook__menu-scroll-top', String(e.currentTarget.scrollTop))
						}
					}}
				>
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
						? <props.contentControl currentPage={selectPage} />
						: null}
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
					{selectLink && (
						<Button
							title='Open in a new tab'
							onClick={() => { window.open(selectLink, '_blank') }}
						>
							<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><rect fill="none" height="24" width="24" /><polygon points="21,11 21,3 13,3 16.29,6.29 6.29,16.29 3,13 3,21 11,21 7.71,17.71 17.71,7.71" /></svg>
						</Button>
					)}
				</div>
				{selectLink && (
					<iframe
						className='playbook__content-container'
						data-playbook-content={true}
						src={selectLink}
						width='100%'
						frameBorder='0'
					/>
				)}
			</div>
		</div>
	)
}

const MenuItemMemoized = React.memo(MenuItem)

function MenuItem(props: { name: string, selected: boolean, onClick: (name: string) => void }) {
	const chunks = props.name.split(/\\|\//)
	const directories = chunks.slice(0, -1)
	const lastName = chunks.at(-1)

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
			{directories.map((name, rank) => (
				<React.Fragment key={rank}>
					{name + '/'}<wbr />
				</React.Fragment>
			))}
			<span className='playbook__menu__item__last'>{lastName}</span>
		</a>
	)
}

function PassThroughContentWrapper(props: { children: React.ReactElement }) {
	return props.children
}

function Button({ active, ...props }: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & { active?: boolean }) {
	return (
		<button
			{...props}
			className={classNames('playbook__button', active && 'playbook__button__active', props.className)}
		/>
	)
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
	return Object.fromEntries(
		compact(
			window.location.search.replace(/^\?/, '')
				.split('&')
		).map(part => {
			const [key, value] = part.split('=')
			return [key, window.decodeURIComponent(value) ?? '']
		})
	)
}

function setQueryParams(params: { [key: string]: string | undefined }, replace: boolean) {
	const link = '?' +
		Object.entries({ ...getQueryParams(), ...params })
			.filter((pair): pair is [string, string] => !!pair[1])
			.map(([key, value]) => key + '=' + window.encodeURIComponent(value))
			.join('&')

	if (replace) {
		window.history.replaceState(null, '', link)
	} else {
		window.history.pushState(null, '', link)
	}
}

export default Playbook
