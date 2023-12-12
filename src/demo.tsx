import React, { useContext } from 'react'
import { createRoot } from 'react-dom/client'

import Playbook from './Playbook'
import './Playbook.less'

createRoot(document.getElementById('root')!).render(
	<Playbook
		pages={[
			{
				name: 'button',
				content: () => <LazyButtons />
			},
			{
				name: 'input',
				content: () => <input key="Single element" value="Plain input box" />
			}
		]}
		contentWrapper={ContentWrapper}
		contentControl={<div>Place your custom controls here <Playbook.Button>Button</Playbook.Button></div>}
	/>
)

const Context = React.createContext(1)

function ContentWrapper(props: { children: React.ReactElement }) {
	return <Context.Provider value={2}>{props.children}</Context.Provider>
}

const LazyButtons = React.lazy(() => Promise.resolve({
	default: () => (
		<Playbook.Catalog>
			<Button>
				Button
			</Button>
			<Button key="Disabled Button" disabled extra={<span>Something</span>}>
				<em>Button</em> Beep
			</Button>
			<div style={{ height: 2000, background: 'yellow' }}>
				Very tall content
			</div>
		</Playbook.Catalog>
	)
}))

function Button(props: { children: React.ReactNode, disabled?: boolean, extra?: any }) {
	const symbol = useContext(Context)

	return <button disabled={props.disabled}>{props.children} {symbol}</button>
}
