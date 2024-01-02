import React, { useMemo, useState, useRef, useContext } from 'react'
import get from 'lodash/get'
import isPlainObject from 'lodash/isPlainObject'
import compact from 'lodash/compact'
import minBy from 'lodash/minBy'
import sumBy from 'lodash/sumBy'
import isNil from 'lodash/isNil'
import classNames from './classNames'

import './Catalog.css'

export default function Catalog(props: {
	children: React.ReactElement | Iterable<React.ReactElement | React.ReactElement[]>
	style?: React.CSSProperties
}) {
	const elements = React.Children.toArray(props.children).map((element, index) =>
		React.isValidElement(element) && (
			<Entry key={index} element={element} style={props.style} />
		)
	)

	return <React.Fragment>{elements}</React.Fragment>
}

const BlinkTrackerContext = React.createContext(new Map<Function, number>())

function Entry(props: { element: React.ReactElement, style: React.CSSProperties | undefined }) {
	const [overridingProps, setOverridingProps] = useState<Record<string, any>>({})

	const [blinkTracker, setBlinkTracker] = useState(new Map<Function, number>())
	const blinkTrackerRef = useRef(new Map<Function, number>())

	const blinkCallbacks = useMemo(() => {
		return Object.fromEntries(compact(Object.entries(props.element.props).map(([name, originalCallback]) => {
			if (typeof originalCallback !== 'function') {
				return null
			}

			const wrapperCallback = (...args) => {
				// Cancel on-going timer
				if (blinkTrackerRef.current.has(originalCallback)) {
					clearTimeout(blinkTrackerRef.current.get(originalCallback))
				}

				const timerID = setTimeout(() => {
					// Stop blinking
					setBlinkTracker(current => {
						const copy = new Map(current)
						copy.delete(wrapperCallback)
						return copy
					})
				}, 3500)

				// Start blinking
				setBlinkTracker(current => {
					const copy = new Map(current)
					copy.set(wrapperCallback, timerID)
					return copy
				})

				blinkTrackerRef.current.set(originalCallback, timerID)

				return originalCallback(...args)
			}

			// Preserve the original function body
			wrapperCallback.toString = () => originalCallback.toString()

			return [name, wrapperCallback] as const
		})))
	}, [props.element])

	const element = useMemo(
		() => React.cloneElement(props.element, { ...overridingProps, ...blinkCallbacks }),
		[props.element, overridingProps, blinkCallbacks]
	)

	return (
		<section className='playbook__catalog'>
			{/^\.\$/.test(props.element.key || '') && (
				<header className='playbook__catalog__caption'>
					<svg className='playbook__catalog__caption__icon' xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M685-128v-418H329l146 146-74 74-273-273 273-273 74 74-146 146h462v524H685Z" /></svg>
					{props.element.key?.match(/^\.\$(.+)/)?.[1]}
				</header>
			)}
			<div className='playbook__catalog__columns'>
				<div className='playbook__catalog__property'>
					<BlinkTrackerContext.Provider value={blinkTracker}>
						<ElementIntrospection setOverridingProps={setOverridingProps}>
							{element}
						</ElementIntrospection>
					</BlinkTrackerContext.Provider>
				</div>
				<div className='playbook__catalog__content'>
					<div style={props.style}>
						{element}
					</div>
				</div>
			</div>
		</section>
	)
}

Catalog.Grid = function CatalogGrid(props: {
	children: React.ReactElement | Iterable<React.ReactElement | React.ReactElement[]>
	style?: React.CSSProperties
}) {
	return (
		<div className='playbook__catalog__grid'>
			<Catalog style={props.style}>
				{props.children}
			</Catalog>
		</div>
	)
}

function ElementIntrospection(props: {
	children: React.ReactNode
	setOverridingProps?: (setter: ((props: object) => object)) => void
}): React.ReactNode {
	const setOverridingProps = props.setOverridingProps

	if (!props.children || props.children === true) {
		return null
	}

	if (typeof props.children === 'string' || typeof props.children === 'number') {
		if (setOverridingProps) {
			return (
				<span
					className='playbook__catalog__property__interactive'
					contentEditable
					suppressContentEditableWarning
					onBlur={(e) => {
						setOverridingProps(otherProps => ({
							...otherProps,
							children: e.target.innerText
						}))
					}}
				>
					{String(props.children)}
				</span>
			)
		}

		return String(props.children)
	}

	if (Array.isArray(props.children)) {
		return props.children.map((node, index) => (
			<ElementIntrospection key={index}>
				{node}
			</ElementIntrospection>
		))
	}

	if (React.isValidElement(props.children)) {
		const tagName = <span className='playbook__catalog__property__tag'>{getTagName(props.children)}</span>

		const { children, ...attributes } = props.children.props
		const attributeElements = Object.entries(attributes).map(([name, value]) => {
			const openingQuote = typeof value === 'string' ? '"' : '{'
			const closingQuote = typeof value === 'string' ? '"' : '}'

			const setOverridingValue = setOverridingProps ? (nextValue: any) => {
				setOverridingProps((otherProps) => ({
					...otherProps,
					[name]: nextValue
				}))
			} : undefined

			return (
				<div
					key={name}
					className='playbook__catalog__property__indent'
				>
					{name}={openingQuote}
					<ValueIntrospection setOverridingValue={setOverridingValue}>
						{value}
					</ValueIntrospection>
					{closingQuote}
				</div>
			)
		})

		if (children) {
			return (
				<div>
					{'<'}{tagName}{attributeElements.length === 0 ? '' : ' '}{attributeElements}{'>'}
					<div className='playbook__catalog__property__indent'>
						<ElementIntrospection setOverridingProps={setOverridingProps}>
							{children}
						</ElementIntrospection>
					</div>
					{'</'}{tagName}{'>'}
				</div>
			)
		} else {
			return <div>{'<'}{tagName}{' '}{attributeElements}{'/>'}</div>
		}
	}

	return null
}

function ValueIntrospection(props: {
	children: any
	setOverridingValue?: (value: any) => void
}): React.ReactNode {
	const setOverridingValue = props.setOverridingValue

	const blinkCallbacks = useContext(BlinkTrackerContext)

	if (React.isValidElement(props.children)) {
		return (
			<div className='playbook__catalog__property__indent'>
				<ElementIntrospection>{props.children}</ElementIntrospection>
			</div>
		)
	}

	if (typeof props.children === 'boolean') {
		const text = String(props.children)

		if (setOverridingValue) {
			return (
				<span
					className='playbook__catalog__property__interactive'
					onClick={() => {
						setOverridingValue(!props.children)
					}}
				>
					{text}
				</span>
			)
		}

		return text
	}

	if (typeof props.children === 'string' || typeof props.children === 'number') {
		const text = String(props.children)

		if (setOverridingValue) {
			return (
				<span
					className='playbook__catalog__property__interactive'
					contentEditable
					suppressContentEditableWarning
					onBlur={(e) => {
						if (typeof props.children === 'number') {
							const nextValue = Number(e.target.innerText)
							if (isNaN(nextValue)) {
								setOverridingValue(e.target.innerText)
							} else {
								setOverridingValue(nextValue)
							}
						} else {
							setOverridingValue(e.target.innerText)
						}
					}}
				>
					{text}
				</span>
			)
		}

		return text
	}

	if (props.children instanceof Date) {
		if (setOverridingValue) {
			return (
				<span>
					new Date("
					<span
						className='playbook__catalog__property__interactive'
						contentEditable
						suppressContentEditableWarning
						onBlur={(e) => {
							setOverridingValue(new Date(e.target.innerText))
						}}
					>
						{props.children.toJSON()}
					</span>
					")
				</span>
			)
		}

		return getContentText(props.children)
	}

	if (typeof props.children === 'function') {
		return (
			<span
				className={classNames('playbook__catalog__property__function', blinkCallbacks.has(props.children) && '--blink')}
				title={getContentText(props.children)}
			>
				function
			</span>
		)
	}

	if (Array.isArray(props.children)) {
		const list: Array<React.ReactElement> = []
		let lastRank = 0
		let textLong = 0
		for (; lastRank < props.children.length; lastRank++) {
			const text = getContentText(props.children[lastRank])
			if (textLong + text.length > 240) {
				break
			}
			list.push(<ValueIntrospection key={lastRank}>{props.children[lastRank]}</ValueIntrospection>)
			textLong += text.length
		}

		if (list.length < props.children.length) {
			const hint: Array<string> = []
			for (; lastRank < props.children.length; lastRank++) {
				const text = getContentText(props.children[lastRank])
				hint.push(text)
			}
			list.push(<span key={lastRank} title={hint.join(',\n')}>...</span>)
		}

		if (textLong > 80) {
			return <span>[{wrapLine(list)}]</span>
		} else {
			return <span>[{wrapItem(list)}]</span>
		}
	}

	if (isPlainObject(props.children)) {
		const list: Array<React.ReactElement> = []
		let lastRank = 0
		let textLong = 0
		const pairs = Object.entries(props.children)
		for (; lastRank < pairs.length; lastRank++) {
			const [key, value] = pairs[lastRank]
			const text = key + ': ' + getContentText(value)
			if (textLong + text.length > 240) {
				break
			}
			list.push(<span key={key}>{key}: <ValueIntrospection>{value}</ValueIntrospection></span>)
			textLong += text.length
		}

		if (list.length < Object.keys(props.children).length) {
			const hint: Array<string> = []
			for (; lastRank < pairs.length; lastRank++) {
				const [k, v] = pairs[lastRank]
				hint.push(k + ': ' + getContentText(v))
			}
			list.push(<span key={lastRank} title={hint.join('\n')}>...</span>)
		}

		if (textLong > 80) {
			return <span>{'{'}{wrapLine(list)}{'}'}</span>
		} else {
			return <span>{'{ '}{wrapItem(list)}{' }'}</span>
		}
	}

	return getContentText(props.children)
}

function getTagName(element: React.ReactElement): string {
	if (element.type === React.Fragment) {
		return 'Fragment'
	}

	if (typeof element.type === 'string') {
		return element.type
	}

	return (
		get(element, 'type.displayName') ||
		get(element, 'type.name') ||
		(get(element, 'type.constructor.name') === 'Function' && get(element, 'type.constructor.name')) ||
		'Untitled'
	)
}

function getContentText(value: any): string {
	if (React.isValidElement<any>(value)) {
		const { children, ...attributes } = value.props
		const attributeText = Object.entries(attributes)
			.map(([name, value]) => {
				const openingQuote = typeof value === 'string' ? '' : '{'
				const closingQuote = typeof value === 'string' ? '' : '}'
				return `${name}=${openingQuote}${getContentText(value)}${closingQuote}`
			}).map(line => '  ' + line.split(/\r?\n/).map(line => '  ' + line).join('\n') + '\n').join('')

		return '<' + getTagName(value) +
			(attributeText ? '\n' + attributeText : '') +
			(isNil(children) ? '/' : ('>' + getContentText(children) + '<' + getTagName(value))) +
			'>'
	}

	if (typeof value === 'function') {
		const lines = String(value).split(/\r?\n/)
		const indent = new RegExp(
			'^' + (
				minBy(
					compact(
						lines.map(line => get(line.replace(/\t/g, '  ').match(/^\s+/), 0))
					),
					match => match.length
				) || ''
			),
		)
		return lines.map(line => line.replace(indent, '')).join('\n')
	}

	if (Array.isArray(value)) {
		const items = value.map(getContentText)
		const length = sumBy(items, item => item.length)
		if (length > 80) {
			return '[\n' + items.map(item => '  ' + item.split(/\r?\n/).map(line => '  ' + line).join('\n') + ',').join('\n') + '\n]'
		} else {
			return '[' + items.join(', ') + ']'
		}
	}

	if (isPlainObject(value)) {
		const items = Object.entries(value).map(([key, value]) => {
			return key + ': ' + getContentText(value)
		})
		const length = sumBy(items, item => item.length)
		if (length > 80) {
			return '{\n' + items.map(item => '  ' + item.split(/\r?\n/).map(line => '  ' + line).join('\n') + ',').join('\n') + '\n}'
		} else {
			return '{ ' + items.join(', ') + ' }'
		}
	}

	if (value instanceof Date) {
		return `new Date("${value.toJSON()}")`
	}

	if (value === undefined) {
		return 'undefined'
	}

	return JSON.stringify(value, null, '')
}

function wrapLine(values: Array<React.ReactElement>) {
	return (
		<div className='playbook__catalog__property__indent'>
			{values.map((value, index) => (
				<React.Fragment key={index}>
					{value},{(index < values.length - 1) && <br />}
				</React.Fragment>
			))}
		</div>
	)
}

function wrapItem(values: Array<React.ReactElement>) {
	return (
		<React.Fragment>
			{values.map((value, index) => (
				<React.Fragment key={index}>
					{value}{(index < values.length - 1) && ', '}
				</React.Fragment>
			))}
		</React.Fragment>
	)
}
