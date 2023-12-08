import _ from 'lodash';
import React from 'react';
export function isStorybook(hash) {
    return _.has(hash, 'stories');
}
function createLogger(...params) {
    console.log(...params);
}
export function transformStorybook({ stories }) {
    return _.map(stories, (render, name) => React.cloneElement(render(createLogger), { key: name }));
}
