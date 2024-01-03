export default function classNames(...classes: Array<string | boolean | undefined | null>) {
	return classes
		.filter((item): item is string => typeof item === 'string')
		.flatMap(item => item.trim().split(/\s+/))
		.join(' ')
}