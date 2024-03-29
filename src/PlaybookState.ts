import { useEffect, useState } from 'react'

const __id = 'react-playbook'

declare global {
	interface Window {
		__playbookState?: Map<string, any>
	}
}

window.__playbookState = new Map<string, any>()

/**
 * Broadcasts a named state change to `pages[].content`.
 */
export function setPlaybookState(name: string, value: any) {
	window.__playbookState!.set(name, value)

	for (const contentWindow of Array.from(window.frames)) {
		contentWindow.postMessage({ __id, name, value }, '*')
	}
}

/**
 * Listens for the named state changes from `contentControl`.
 * @returns the latest value of the given named state
 */
export function usePlaybookState<T = any>(name: string, defaultValue: T) {
	const [value, setValue] = useState(defaultValue)

	useEffect(() => {
		if (window.opener && window.opener.__playbookState?.has(name)) {
			setValue(window.opener.__playbookState.get(name))

		} else if (window.parent && window.parent.__playbookState?.has(name)) {
			setValue(window.parent.__playbookState.get(name))

		} else {
			setValue(defaultValue)
		}

		const onMessage = (e: MessageEvent) => {
			if (e.data && e.data.__id === __id && e.data.name === name) {
				setValue(e.data.value)
			}
		}

		window.addEventListener('message', onMessage, false)

		return () => {
			window.removeEventListener('message', onMessage)
		}
	}, [name])

	return value
}
