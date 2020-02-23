import _ from 'lodash'
import React from 'react'

export type Storybook = {
	stories: {
		[name: string]: (_createLogger: typeof createLogger) => React.ReactElement
	}
}

export function isStorybook(hash: any): hash is Storybook {
	return _.has(hash, 'stories')
}

function createLogger(...params) {
	// eslint-disable-next-line no-console
	console.log(...params)
}

export function transformStorybook({ stories }: Storybook): React.ReactNodeArray {
	return _.map(stories, (render, name) =>
		React.cloneElement(render(createLogger), { key: name }),
	)
}
