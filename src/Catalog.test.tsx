import { it, expect } from 'vitest'
import { getTagName } from './Catalog'
import React from 'react'
import Stub from './Stub'

it('returns component name', () => {
	expect(getTagName(<React.Fragment />)).toBe('Fragment')

	expect(getTagName(<div />)).toBe('div')

	const MyComponent1 = () => <div />
	MyComponent1.displayName = 'MyComponent1'
	expect(getTagName(<MyComponent1 />)).toBe('MyComponent1')

	function MyComponent2() {
		return <div />
	}
	expect(getTagName(<MyComponent2 />)).toBe('MyComponent2')

	class MyComponent3 extends React.Component {
		render() {
			return <div />
		}
	}
	expect(getTagName(<MyComponent3 />)).toBe('MyComponent3')

	expect(getTagName(<Stub />)).toBe('Component')
})
