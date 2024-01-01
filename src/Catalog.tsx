import React, { useState } from 'react'
import get from 'lodash/get'
import isPlainObject from 'lodash/isPlainObject'
import compact from 'lodash/compact'
import minBy from 'lodash/minBy'
import sumBy from 'lodash/sumBy'
import isNil from 'lodash/isNil'

import './Catalog.css'

export default function Catalog(props: {
	children: React.ReactElement | Iterable<React.ReactElement | React.ReactElement[]>
	style?: React.CSSProperties
}) {
	const elements = React.Children.toArray(props.children).map((element, index) =>
		React.isValidElement(element) && (
			<Element key={index} element={element} style={props.style} />
		)
	)

	return <React.Fragment>{elements}</React.Fragment>
}

function Element(props: { element: React.ReactElement, style: React.CSSProperties | undefined }) {
	const [overridingProps, setOverridingProps] = useState<any>({})

	return (
		<section className='playbook__catalog'>
			{React.isValidElement(props.element) && /^\.\$/.test(props.element.key || '') && (
				<header className='playbook__catalog__caption'>
					<svg className='playbook__catalog__caption__icon' xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M685-128v-418H329l146 146-74 74-273-273 273-273 74 74-146 146h462v524H685Z" /></svg>
					{props.element.key?.match(/^\.\$(.+)/)?.[1]}
				</header>
			)}
			<div className='playbook__catalog__columns'>
				<div className='playbook__catalog__property'>
					<ElementResolver setOverridingProps={setOverridingProps}>
						{React.cloneElement(props.element, overridingProps)}
					</ElementResolver>
				</div>
				<div className='playbook__catalog__content'>
					<div style={props.style}>
						{React.cloneElement(props.element, overridingProps)}
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

function ElementResolver(props: {
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
			<ElementResolver key={index}>
				{node}
			</ElementResolver>
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
					<ValueResolver setOverridingValue={setOverridingValue}>
						{value}
					</ValueResolver>
					{closingQuote}
				</div>
			)
		})

		if (children) {
			return (
				<div>
					{'<'}{tagName}{attributeElements.length === 0 ? '' : ' '}{attributeElements}{'>'}
					<div className='playbook__catalog__property__indent'>
						<ElementResolver setOverridingProps={setOverridingProps}>
							{children}
						</ElementResolver>
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

function ValueResolver(props: {
	children: any
	setOverridingValue?: (value: any) => void
}): React.ReactNode {
	const setOverridingValue = props.setOverridingValue

	if (React.isValidElement(props.children)) {
		return (
			<div className='playbook__catalog__property__indent'>
				<ElementResolver>{props.children}</ElementResolver>
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
				className='playbook__catalog__property__function'
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
			list.push(<ValueResolver key={lastRank}>{props.children[lastRank]}</ValueResolver>)
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
			list.push(<span key={key}>{key}: <ValueResolver>{value}</ValueResolver></span>)
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
