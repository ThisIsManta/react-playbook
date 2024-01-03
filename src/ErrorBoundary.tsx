import React from 'react'

export default class ErrorBoundary extends React.PureComponent<{ children: React.ReactNode }, { error?: any }> {
	constructor(props) {
		super(props)

		this.state = {}
	}

	static getDerivedStateFromError(error) {
		return { error }
	}

	render() {
		if (this.state.error) {
			return (
				<div
					style={{
						display: 'inline-block',
						background: 'red',
						color: 'white',
						padding: '10px',
						fontFamily: 'var(--font-family)',
						fontWeight: 400,
						fontSize: '14px'
					}}
				>
					{String(this.state.error)}
				</div >
			)
		}

		return this.props.children
	}
}
