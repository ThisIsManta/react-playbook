import React from 'react'
import get from 'lodash/get'
import escape from 'lodash/escape'
import isObject from 'lodash/isObject'
import identity from 'lodash/identity'
import compact from 'lodash/compact'
import minBy from 'lodash/minBy'

import './Catalog.css'

export default function Catalog(props: {
	children: React.ReactElement | Iterable<React.ReactElement | React.ReactElement[]>
	style?: React.CSSProperties
}) {
	const elements = React.Children.toArray(props.children).map((element, index) => (
		<section key={index} className='playbook__catalog'>
			{React.isValidElement(element) && /^\.\$/.test(element.key || '') && (
				<header className='playbook__catalog__caption'>
					<svg className='playbook__catalog__caption__icon' xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M685-128v-418H329l146 146-74 74-273-273 273-273 74 74-146 146h462v524H685Z" /></svg>
					{element.key?.match(/^\.\$(.+)/)?.[1]}
				</header>
			)}
			<div className='playbook__catalog__columns'>
				<div
					className='playbook__catalog__property'
					dangerouslySetInnerHTML={{ __html: getNodeHTML(element) }}
				/>
				<div className='playbook__catalog__content' style={props.style}>
					{element}
				</div>
			</div>
		</section>
	))

	return <React.Fragment>{elements}</React.Fragment>
}

function getNodeHTML(node: React.ReactNode): string {
	if (!node || node === true) {
		return ''
	}

	if (typeof node === 'string' || typeof node === 'number') {
		return escape(String(node))
	}

	if (Array.isArray(node)) {
		return node.map(getNodeHTML).join('')
	}

	if (React.isValidElement(node)) {
		const tagName = `<span class="playbook__catalog__property__tag">${escape(getTagName(node))}</span>`
		const { children, ...attributes } = node.props

		let outerHTML = escape('<') + tagName

		outerHTML += Object.entries(attributes).map(([name, value]) => {
			const openingQuote = typeof value === 'string' ? '' : '{'
			const closingQuote = typeof value === 'string' ? '' : '}'
			return (
				`<div class="playbook__catalog__property__indent">${escape(name)}=${openingQuote}${getPropValueHTML(value, 'html')}${closingQuote}</div>`
			)
		}).join('')

		const innerHTML = getNodeHTML(children)

		if (innerHTML) {
			outerHTML += escape('>') + '<div class="playbook__catalog__property__indent">' + innerHTML + '</div>' + escape('</') + tagName + escape('>')
		} else {
			outerHTML += escape('/>')
		}

		return outerHTML
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
		get(element, 'type.displayName') ||
		get(element, 'type.name') ||
		(get(element, 'type.constructor.name') === 'Function' && get(element, 'type.constructor.name')) ||
		'Untitled'
	)
}

function getPropValueHTML(value: any, mode: 'html' | 'text'): string {
	const lineFeed = mode === 'html' ? '<br/>' : '\n'
	const addIndent = (text: string) => {
		if (mode === 'html') {
			return '<div class="playbook__catalog__property__indent">' + text + '</div>'
		}

		return '\n' + text.split(/\r?\n/).map(line => '  ' + line).join('\n') + '\n'
	}

	if (React.isValidElement(value)) {
		return '<div class="playbook__catalog__property__indent">' + getNodeHTML(value) + '</div>'
	}

	if (typeof value === 'function') {
		if (mode === 'text') {
			return 'Function'
		}

		const list = String(value).split(/\r?\n/)
		const indent = new RegExp(
			'^' + (
				minBy(
					compact(
						list.map(line => get(line.replace(/\t/g, '  ').match(/^\s+/), 0))
					),
					match => match.length
				) || ''
			),
		)
		const text = list.map(line => line.replace(indent, '')).join('\n')

		return '<span class="playbook__catalog__property__function" title="' +
			escape(text) +
			'">Function</span>'
	}

	if (Array.isArray(value)) {
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

		const wrap = list.length > 1 || textLong > 120 ? addIndent : identity
		return '[' + wrap(list.join(',' + lineFeed)) + ']'
	}

	if (isObject(value)) {
		const list: Array<string> = []
		let lastRank = 0
		let textLong = 0
		const pairs = Object.entries(value)
		for (; lastRank < pairs.length; lastRank++) {
			const [k, v] = pairs[lastRank]
			const text = escape(k) + ': ' + getPropValueHTML(v, mode)
			if (textLong + text.length > 240 && mode === 'html') {
				break
			}
			list.push(text)
			textLong += text.length
		}

		if (list.length < Object.keys(value).length) {
			const hint: Array<string> = []
			for (; lastRank < pairs.length; lastRank++) {
				const [k, v] = pairs[lastRank]
				const text = escape(k) + ': ' + getPropValueHTML(v, 'text')
				hint.push(text)
			}
			list.push('<span title="' + hint.join('\n') + '">...</span>')
		}

		const wrap = list.length > 1 || textLong > 120 ? addIndent : identity
		return '{ ' + wrap(list.join(',' + lineFeed)) + ' }'
	}

	return escape(JSON.stringify(value, null, ''))
}
