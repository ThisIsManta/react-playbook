import React from 'react'
import { createRoot } from 'react-dom/client'

import Playbook from '../Playbook'
import Catalog from '../Catalog'

const root = createRoot(document.getElementById('root')!)

root.render(
	<Playbook
		pages={[
			// List all your components here
			{
				name: 'ui-kit/button',
				content: Button
			},
			{
				name: 'ui-kit/emoji',
				content: Emoji
			},
			{
				name: 'lazy loading',
				content: () => <LazyComponent />
			},
			{
				name: 'long content',
				content: () => (
					<div style={{ height: 2000, background: 'yellow' }}>
						Observe the vertical scrollbar
					</div>
				)
			}
		]}
		contentWrapper={
			// Pass a wrapper component to each of your component
			// Useful for passing common React contexts or customize the background color
			ContentWrapper
		}
		contentControl={() => (
			// Pass zero or more components to be displayed at the top bar
			<Playbook.Button
				onClick={() => {
					window.open('https://github.com/ThisIsManta/react-playbook/tree/master/src/demo/index.tsx')
				}}
			>
				View source code on GitHub
			</Playbook.Button>
		)}
	/>
)

function Button() {
	return (
		<Catalog>
			<button>
				Button
			</button>

			<button onClick={(e) => { console.log('onClick', e) }}>
				Click here and observe the blinking function on the left
			</button>

			<button
				key="caption goes here"
				title="tooltip"
				disabled={true}
				data-element={<span title="something">Something</span>}
				data-string="String"
				data-number={1}
				data-date={new Date()}
				data-dummy={undefined}
				data-null={null}
				data-array-short={[1, 2, 3]}
				data-array-long={[1234567890, 1234567890, 1234567890, 1234567890, 1234567890, 1234567890, 1234567890, 1234567890, 1234567890]}
			>
				Click <strong>true</strong> as in `disabled={'{true}'}` to toggle this <em>disabled</em> button
			</button>
		</Catalog>
	)
}

function Emoji() {
	return (
		<Catalog.Grid style={{ width: 100 }}>
			{['🍎', '🍊', '🍋', '🍐'].map(emoji =>
				<i key={emoji}>{emoji}</i>
			)}
		</Catalog.Grid>
	)
}

const LazyComponent = React.lazy(() => Promise.resolve({
	default: () => (
		<p><code>React.lazy</code> is supported.</p>
	)
}))

function ContentWrapper(props: { children: React.ReactElement }) {
	return (
		<div style={{ border: '1px dotted black' }}>
			{props.children}
		</div>
	)
}
