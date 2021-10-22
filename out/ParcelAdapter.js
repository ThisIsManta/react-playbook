import _ from 'lodash';
export function isExportDefault(input) {
    return _.has(input, 'default');
}
