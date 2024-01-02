import React from 'react'
import { createRoot } from 'react-dom/client'

import Playbook from './Playbook'
import Catalog from './Catalog'

createRoot(document.getElementById('root')!).render(
	<Playbook
		pages={[
			{
				name: 'ui-kit/button',
				content: () => (
					<Catalog>
						<button />
						<button>
							Button
						</button>
						<button
							key="caption goes here"
							title="tooltip"
							disabled={false}
							onClick={(e) => { console.log('onClick', e) }}
							data-element={<span title="something">Something</span>}
							data-string="String"
							data-number={1}
							data-date={new Date()}
							data-dummy={undefined}
							data-null={null}
							data-array-short={[1, 2, 3]}
							data-array-long={[1234567890, 1234567890, 1234567890, 1234567890, 1234567890, 1234567890, 1234567890, 1234567890, 1234567890]}
						>
							<em><strong>Button</strong></em> Beep
						</button>
						{[1, 2, 3].map(i => <button key={i}>Button {i}</button>)}
						<div style={{ height: 2000, background: 'yellow' }}>
							Very tall content
						</div>
					</Catalog>
				)
			},
			{
				name: 'ui-kit/input',
				content: () => <input key="Single element" value="Plain input box" />
			},
			{
				name: 'ui-kit/icon',
				content: () => (
					<Catalog.Grid style={{ width: 100 }}>
						<i>🍎</i>
						<i>🍊</i>
						<i>🍋</i>
						<i>🍐</i>
					</Catalog.Grid>
				)
			},
			{
				name: 'lazy loading',
				content: () => <LazyComponent />
			}
		]}
		contentWrapper={ContentWrapper}
		contentControl={() => (
			<Playbook.Button>
				Sample
			</Playbook.Button>
		)}
	/>
)

function ContentWrapper(props: { children: React.ReactElement }) {
	return <div style={{ border: '1px dotted black' }}>ContentWrapper{props.children}</div>
}

const LazyComponent = React.lazy(() => Promise.resolve({
	default: () => (
		<p>Loaded</p>
	)
}))
