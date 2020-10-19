import React from 'react'
import ReactDOM from 'react-dom'

import Playbook from './Playbook'
import PlaybookButton from './PlaybookButton'
import './Playbook.less'

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
		contentWrapper={ContentWrapper}
		contentControl={<PlaybookButton>Dummy</PlaybookButton>}
	/>,
	document.getElementById('root'),
)

function ContentWrapper(props: { children: React.ReactElement }) {
	return <main>{props.children}</main>
}