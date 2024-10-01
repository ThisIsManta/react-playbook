import { it, describe, expect, afterEach, vi } from 'vitest'
import { render, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'
import Playbook, { Index, MenuItem } from './Playbook'

afterEach(() => {
	cleanup()
})

describe(Index, () => {
	it('renders page list', () => {
		const { getByText } = render(
			<Index
				pages={[
					{ name: 'quick brown fox', content: () => <div>Content 1</div> },
					{ name: 'lazy yawning dog', content: () => <div>Content 2</div> }]}
			/>
		)

		expect(getByText('quick brown fox')).toBeDefined()
		expect(getByText('lazy yawning dog')).toBeDefined()
	})

	it('renders the first page by default', () => {
		const { container } = render(
			<Index
				pages={[
					{ name: 'quick brown fox', content: () => <div>Content 1</div> },
					{ name: 'lazy yawning dog', content: () => <div>Content 2</div> }]}
			/>
		)

		expect(container.querySelector<HTMLIFrameElement>('iframe[data-playbook-content="true"]')?.src).toMatchInlineSnapshot(`"http://localhost:3000/?r=quick%20brown%20fox"`)
	})

	it('renders the pages that match search word', () => {
		const { queryByText, getByPlaceholderText } = render(
			<Index
				pages={[
					{ name: 'quick brown fox', content: () => <div>Content 1</div> },
					{ name: 'lazy yawning dog', content: () => <div>Content 2</div> }]}
			/>
		)

		expect(queryByText('quick brown fox')).not.toBeNull()
		expect(queryByText('lazy yawning dog')).not.toBeNull()

		const searchBox = getByPlaceholderText('Search')
		fireEvent.change(searchBox, { target: { value: 'fox' } })

		expect(queryByText('quick brown fox')).not.toBeNull()
		expect(queryByText('lazy yawning dog')).toBeNull()
	})

	it('renders the empty state, given zero-matching search word', () => {
		const { queryByText, getByPlaceholderText } = render(
			<Index
				pages={[
					{ name: 'quick brown fox', content: () => <div>Content 1</div> },
					{ name: 'lazy yawning dog', content: () => <div>Content 2</div> }]}
			/>
		)

		const searchBox = getByPlaceholderText('Search')
		fireEvent.change(searchBox, { target: { value: 'buffalo' } })

		expect(queryByText('quick brown fox')).toBeNull()
		expect(queryByText('lazy yawning dog')).toBeNull()
	})
})

describe(MenuItem, () => {
	it('renders the relative URL', () => {
		const { container } = render(
			<MenuItem name="path/to/component name" selected={false} onClick={vi.fn()} />
		)

		expect(container.querySelector<HTMLAnchorElement>('a')?.href).toMatchInlineSnapshot(`"http://localhost:3000/?p=path/to/component%20name"`)
	})

	it('renders the plain text, given a non URL', () => {
		const { container } = render(
			<MenuItem name="name" selected={false} onClick={vi.fn()} />
		)

		expect(container.textContent).toBe('name')
	})

	it('renders last name in bold, given a URL', () => {
		const { container } = render(
			<MenuItem name="path/to/component name" selected={false} onClick={vi.fn()} />
		)

		expect(container.textContent).toBe('path/to/component name')
		expect(container.querySelector('.playbook__menu__item')).toMatchInlineSnapshot(`
			<a
			  class="playbook__menu__item"
			  href="?p=path/to/component%20name"
			>
			  path/
			  <wbr />
			  to/
			  <wbr />
			  <span
			    class="playbook__menu__item__last"
			  >
			    component name
			  </span>
			</a>
		`)
	})
})

describe(Playbook.Button, () => {
	it('renders the button with its pass-through props', () => {
		const { container } = render(
			<Playbook.Button disabled>
				Content
			</Playbook.Button>
		)

		expect(container.textContent).toBe('Content')
		expect(container.querySelector<HTMLButtonElement>('button')?.disabled).toBe(true)
	})


	it('renders the button in the active state', () => {
		const { container } = render(
			<Playbook.Button active>
				Content
			</Playbook.Button>
		)

		expect(container.firstElementChild?.classList).toContain('playbook__button__active')
	})
})