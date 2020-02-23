import _ from 'lodash'

export function isExportDefault(input: any): input is { default: any } {
	return _.has(input, 'default')
}
