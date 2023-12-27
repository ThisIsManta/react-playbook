import React, { useContext } from 'react'
import { createRoot } from 'react-dom/client'

import Playbook from './Playbook'
import Catalog from './Catalog'

createRoot(document.getElementById('root')!).render(
	<Playbook
		pages={[
			{
				name: 'ui-kit/button',
				content: () => <LazyButtons />
			},
			{
				name: 'ui-kit/input',
				content: () => <input key="Single element" value="Plain input box" />
			}
		]}
		contentWrapper={ContentWrapper}
		contentControl={() => <Playbook.Button><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg> Sample</Playbook.Button>}
	/>
)

const Context = React.createContext(1)

function ContentWrapper(props: { children: React.ReactElement }) {
	return <Context.Provider value={2}>{props.children}</Context.Provider>
}

const LazyButtons = React.lazy(() => Promise.resolve({
	default: () => (
		<Catalog>
			<Button>
				Button
			</Button>
			<Button key="Disabled Button" disabled extra={<span>Something</span>}>
				<em>Button</em> Beep
			</Button>
			{[1, 2, 3].map(i => <Button key={i}>Button {i}</Button>)}
			<div style={{ height: 2000, background: 'yellow' }}>
				Very tall content
			</div>
		</Catalog>
	)
}))

function Button(props: { children: React.ReactNode, disabled?: boolean, extra?: any }) {
	const symbol = useContext(Context)

	return <button disabled={props.disabled}>{props.children} {symbol}</button>
}
