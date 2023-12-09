import React from 'react'
import { createRoot } from 'react-dom/client'

import Playbook from './Playbook'
import './Playbook.less'

createRoot(document.getElementById('root')!).render(
	<Playbook
		pages={[
			{
				name: 'button',
				content: (
					<React.Fragment>
						<button>Button</button>
						<button disabled>Button</button>
					</React.Fragment>
				)
			},
			{
				name: 'input',
				content: {
					'default': <input />,
					'disabled': <input disabled />,
				}
			},
			{
				name: 'textarea',
				content: () => <textarea></textarea>
			}
		]}
		contentWrapper={ContentWrapper}
		contentControl={<Playbook.Button> Dummy</Playbook.Button>}
	/>
)

function ContentWrapper(props: { children: React.ReactElement }) {
	return <div>{props.children}</div>
}