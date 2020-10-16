import React from 'react'
import ReactDOM from 'react-dom'

import Playbook from './Playbook'
import './Playbook.css'

ReactDOM.render(
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
				content: (
					<React.Fragment>
						<input />
						<input disabled />
					</React.Fragment>
				)
			}
		]}
	/>,
	document.getElementById('root'),
)