var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import _ from 'lodash';
import FuzzySearch from './FuzzySearch';
function classNames(...classes) {
    return _.compact(classes).join(' ');
}
const previewPathName = window.decodeURI(window.location.pathname.replace(/^\//, ''));
if (previewPathName) {
    document.body.classList.add('playbook__preview');
}
const darkMode = window.localStorage.getItem('playbook__dark-mode') === 'true';
if (darkMode) {
    document.body.classList.add('playbook__dark-mode');
}
const Playbook = function Playbook(props) {
    const pages = useMemo(() => _.chain(props.pages)
        .uniqBy(page => page.name)
        .sortBy(page => page.name)
        .value(), [props.pages]);
    if (previewPathName) {
        const page = _.find(pages, page => page.name === previewPathName);
        if (!page) {
            return null;
        }
        const elements = getElements(page.content);
        if (elements.length === 0) {
            return null;
        }
        const index = parseInt(window.location.hash.replace(/^#/, '')) || 0;
        const element = elements[index];
        if (!element) {
            return null;
        }
        const ContentWrapper = props.contentWrapper || PassThroughContentWrapper;
        return (_jsx(ErrorBoundary, { children: _jsx(ContentWrapper, { children: element.element }, void 0) }, void 0));
    }
    return (_jsx(ErrorBoundary, { children: _jsx(Index, Object.assign({}, props, { pages: pages }), void 0) }, void 0));
};
Playbook.Button = Button;
function Index(props) {
    const getSelectPage = useCallback(() => _.find(props.pages, page => page.name === getQueryParams()['p']), [props.pages]);
    const getSearchText = useCallback(() => getQueryParams()['q'] || '', []);
    const [selectPage, setSelectPage] = useState(getSelectPage);
    const [searchText, setSearchText] = useState(getSearchText);
    useEffect(() => {
        const firstPage = props.pages[0];
        if (selectPage === undefined && firstPage) {
            setQueryParams({ p: firstPage.name }, true);
            setSelectPage(firstPage);
        }
    }, [props.pages]);
    useEffect(() => {
        window.addEventListener('popstate', () => {
            setSelectPage(getSelectPage());
            setSearchText(getSearchText());
        });
    }, []);
    useEffect(() => {
        setQueryParams({ q: searchText }, true);
    }, [searchText]);
    const searcher = useMemo(() => new FuzzySearch(props.pages, ['name'], { caseSensitive: false, sort: true }), [props.pages]);
    const [leftMenuVisible, setLeftMenuVisible] = useState(false);
    const [propertyPanelVisible, setPropertyPanelVisible] = useState(() => { var _a; return ((_a = window.sessionStorage.getItem('playbook__property-panel-visible')) !== null && _a !== void 0 ? _a : 'true') === 'true'; });
    useEffect(() => {
        if (propertyPanelVisible) {
            window.sessionStorage.setItem('playbook__property-panel-visible', 'true');
        }
        else {
            window.sessionStorage.removeItem('playbook__property-panel-visible');
        }
    }, [propertyPanelVisible]);
    const onMenuItemClick = useCallback((pageName) => {
        setSelectPage(props.pages.find(page => page.name === pageName));
        setQueryParams({ p: pageName }, false);
        setLeftMenuVisible(false);
    }, [props.pages]);
    const menus = useMemo(() => searcher.search(searchText).map(page => (_jsx(MenuItemMemoized, { name: page.name, selected: page.name === (selectPage === null || selectPage === void 0 ? void 0 : selectPage.name), onClick: onMenuItemClick }, page.name))), [searcher, searchText, selectPage]);
    return (_jsxs("div", Object.assign({ className: 'playbook' }, { children: [_jsx("link", { href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,600&family=Roboto+Mono:400,600&display=swap', rel: 'stylesheet' }, void 0), _jsxs("div", Object.assign({ className: classNames('playbook__left', leftMenuVisible && 'playbook__left-responsive'), tabIndex: -1, onKeyUp: e => {
                    if (e.key === 'Escape') {
                        setLeftMenuVisible(false);
                    }
                } }, { children: [_jsx("input", { className: 'playbook__search-box', type: 'text', placeholder: 'Search here', value: searchText, onChange: e => {
                            setSearchText(e.target.value);
                        }, onKeyUp: e => {
                            if (e.key === 'Escape' && searchText !== '') {
                                setSearchText('');
                                e.stopPropagation();
                            }
                        } }, void 0), _jsx("div", Object.assign({ className: 'playbook__menu' }, { children: menus }), void 0)] }), void 0), _jsxs("div", Object.assign({ className: 'playbook__right' }, { children: [_jsxs("div", Object.assign({ className: 'playbook__toolbar' }, { children: [_jsx(Button, Object.assign({ id: 'playbook__side-menu-toggle', title: 'Open navigation menu', onClick: () => { setLeftMenuVisible(value => !value); } }, { children: _jsxs("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" }, { children: [_jsx("path", { d: "M0 0h24v24H0z", fill: "none" }, void 0), _jsx("path", { d: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" }, void 0)] }), void 0) }), void 0), React.isValidElement(props.contentControl) || !props.contentControl
                                ? props.contentControl
                                : _jsx(props.contentControl, {}, void 0), _jsx("div", { style: { flex: '1 1 auto' } }, void 0), _jsx(Button, Object.assign({ title: 'Toggle dark mode', onClick: () => {
                                    if (darkMode) {
                                        window.localStorage.removeItem('playbook__dark-mode');
                                    }
                                    else {
                                        window.localStorage.setItem('playbook__dark-mode', 'true');
                                    }
                                    window.location.reload();
                                } }, { children: darkMode
                                    ? _jsxs("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" }, { children: [_jsx("path", { d: "M0 0h24v24H0z", fill: "none" }, void 0), _jsx("path", { d: "M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" }, void 0)] }), void 0)
                                    : _jsxs("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" }, { children: [_jsx("path", { d: "M0 0h24v24H0z", fill: "none" }, void 0), _jsx("path", { d: "M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z" }, void 0)] }), void 0) }), void 0), _jsx(Button, Object.assign({ id: 'playbook__property-panel-toggle', title: propertyPanelVisible ? 'Hide property panel' : 'Show property panel', onClick: () => { setPropertyPanelVisible(value => !value); } }, { children: propertyPanelVisible
                                    ? _jsxs("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" }, { children: [_jsx("path", { d: "M0 0h24v24H0z", fill: "none" }, void 0), _jsx("path", { d: "M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" }, void 0)] }), void 0)
                                    : _jsxs("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" }, { children: [_jsx("path", { d: "M0 0h24v24H0z", fill: "none" }, void 0), _jsx("path", { d: "M23 21.74l-1.46-1.46L7.21 5.95 3.25 1.99 1.99 3.25l2.7 2.7h-.64c-1.11 0-1.99.89-1.99 2l-.01 11c0 1.11.89 2 2 2h15.64L21.74 23 23 21.74zM22 7.95c.05-1.11-.84-2-1.95-1.95h-4V3.95c0-1.11-.89-2-2-1.95h-4c-1.11-.05-2 .84-2 1.95v.32l13.95 14V7.95zM14.05 6H10V3.95h4.05V6z" }, void 0)] }), void 0) }), void 0)] }), void 0), _jsx("div", Object.assign({ className: 'playbook__contents' }, { children: selectPage && (_jsx(ContentsMemoized, { page: selectPage, propertyPanelVisible: propertyPanelVisible }, void 0)) }), void 0)] }), void 0)] }), void 0));
}
const MenuItemMemoized = React.memo(MenuItem);
function MenuItem(props) {
    return (_jsx("a", Object.assign({ className: classNames('playbook__menu__item', props.selected && '--select'), href: '?p=' + window.encodeURI(props.name), onClick: e => {
            e.preventDefault();
            props.onClick(props.name);
        } }, { children: props.name.split(/\\|\//).map((part, rank, list) => (rank === list.length - 1
            ? _jsx("span", Object.assign({ className: 'playbook__menu__item__last' }, { children: part }), rank)
            : _jsxs("span", { children: [part, "/"] }, rank))) }), void 0));
}
const ContentsMemoized = React.memo(Contents);
function Contents(props) {
    const elements = getElements(props.page.content);
    if (elements.length === 0) {
        return (_jsxs("div", Object.assign({ className: 'playbook__error' }, { children: ["Expected to render React elements, but found ", JSON.stringify(props.page.content), "."] }), void 0));
    }
    return (_jsx(React.Fragment, { children: elements.map(({ caption, element }, index) => (_jsx(Content, { link: '/' + window.encodeURI(props.page.name) + '#' + index, caption: caption, element: element, propertyPanelVisible: props.propertyPanelVisible }, props.page.name + '#' + index))) }, void 0));
}
function PassThroughContentWrapper(props) {
    return props.children;
}
const minimumPropertyPanelHeight = 45;
function Content(props) {
    const propertyPanel = useRef(null);
    return (_jsxs("div", { children: [props.caption && _jsxs("header", Object.assign({ className: 'playbook__content-caption' }, { children: [_jsxs("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", className: 'playbook__content-caption__icon' }, { children: [_jsx("path", { d: "M0 0h24v24H0V0z", fill: "none" }, void 0), _jsx("path", { d: "M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" }, void 0)] }), void 0), props.caption] }), void 0), _jsxs("div", Object.assign({ className: 'playbook__content-container' }, { children: [_jsxs("div", Object.assign({ className: 'playbook__content-preview' }, { children: [_jsx("iframe", { "data-playbook-content": true, src: props.link, width: '100%', height: minimumPropertyPanelHeight + 'px', frameBorder: '0', scrolling: 'no', onLoad: (e) => {
                                    var _a, _b;
                                    const w = e.currentTarget.contentWindow;
                                    if (w) {
                                        const actualContentHeight = w.document.body.clientHeight;
                                        const expectedFrameHeight = actualContentHeight <= 40
                                            ? Math.round(window.innerHeight * 0.8)
                                            : w.document.documentElement.scrollHeight;
                                        const propertyPanelHeight = (_b = (_a = propertyPanel.current) === null || _a === void 0 ? void 0 : _a.clientHeight) !== null && _b !== void 0 ? _b : 0;
                                        e.currentTarget.style.height = Math.max(expectedFrameHeight, propertyPanelHeight) + 'px';
                                        e.currentTarget.setAttribute('scrolling', 'auto');
                                    }
                                } }, void 0), _jsx(Button, Object.assign({ id: 'playbook__new-window', title: 'Open in a new tab', onClick: () => { window.open(props.link, '_blank'); } }, { children: _jsxs("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", enableBackground: "new 0 0 24 24", viewBox: "0 0 24 24" }, { children: [_jsx("rect", { fill: "none", height: "24", width: "24" }, void 0), _jsx("path", { d: "M9,5v2h6.59L4,18.59L5.41,20L17,8.41V15h2V5H9z" }, void 0)] }), void 0) }), void 0)] }), void 0), _jsx("div", { className: classNames('playbook__property', props.propertyPanelVisible && 'playbook__property__hidden'), ref: propertyPanel, dangerouslySetInnerHTML: { __html: getNodeHTML(props.element) } }, void 0)] }), void 0)] }, void 0));
}
function Button(props) {
    return _jsx("button", Object.assign({ className: 'playbook__button' }, props), void 0);
}
export function getElements(content) {
    if (_.isArray(content)) {
        return Δ(content);
    }
    if (React.isValidElement(content)) {
        if (content.type === React.Fragment) {
            const fragment = content;
            if (_.isArray(fragment.props.children)) {
                return Δ(fragment.props.children);
            }
            else {
                return Δ([fragment.props.children]);
            }
        }
        return [{ element: content }];
    }
    if (_.isPlainObject(content)) {
        return _.toPairs(content)
            .filter(([, element]) => React.isValidElement(element))
            .map(([caption, element]) => ({ caption, element }));
    }
    return [];
}
function Δ(elements) {
    return elements.filter(React.isValidElement).map(element => ({ element }));
}
function getNodeHTML(node) {
    if (!node || node === true) {
        return '';
    }
    if (typeof node === 'string' || typeof node === 'number') {
        return _.escape(String(node));
    }
    if (Array.isArray(node)) {
        return node.map(getNodeHTML).join('');
    }
    if (React.isValidElement(node)) {
        const tagName = `<span class="playbook__property__tag">${_.escape(getTagName(node))}</span>`;
        const _a = node.props, { children } = _a, attributes = __rest(_a, ["children"]);
        let outerHTML = _.escape('<') + tagName;
        outerHTML += _.map(attributes, (value, name) => {
            const openingQuote = typeof value === 'string' ? '' : '{';
            const closingQuote = typeof value === 'string' ? '' : '}';
            return (`<div class="playbook__property__indent">${_.escape(name)}=${openingQuote}${getPropValueHTML(value, 'html')}${closingQuote}</div>`);
        }).join('');
        const innerHTML = getNodeHTML(children);
        if (innerHTML) {
            outerHTML += _.escape('>') + innerHTML + _.escape('</') + tagName + _.escape('>');
        }
        else {
            outerHTML += _.escape('/>');
        }
        return '<div class="playbook__property__indent">' + outerHTML + '</div>';
    }
    console.warn('Found an unrecognized node type:', node);
    return '';
}
function getTagName(element) {
    if (element.type === React.Fragment) {
        return 'Fragment';
    }
    if (typeof element.type === 'string') {
        return element.type;
    }
    return (_.get(element, 'type.displayName') ||
        _.get(element, 'type.name') ||
        _.get(element, 'type.constructor.name') ||
        'Untitled');
}
function getPropValueHTML(value, mode) {
    var _a;
    const lineFeed = mode === 'html' ? '<br/>' : '\n';
    const addIndent = (text) => {
        if (mode === 'html') {
            return '<div class="playbook__property__indent">' + text + '</div>';
        }
        return '\n' + text.split(/\r?\n/).map(line => '  ' + line).join('\n') + '\n';
    };
    if (React.isValidElement(value)) {
        return getNodeHTML(value);
    }
    if (_.isFunction(value)) {
        if (mode === 'text') {
            return 'Function';
        }
        const list = String(value).split(/\r?\n/);
        const indent = new RegExp((_a = '^' + _.chain(list)
            .map(line => line.replace(/\t/g, '  ').match(/^\s+/))
            .compact()
            .map(([match]) => match)
            .minBy(match => match.length)
            .value()) !== null && _a !== void 0 ? _a : '');
        const text = list.map(line => line.replace(indent, '')).join('\n');
        return '<span class="playbook__property__function" title="' +
            _.escape(text) +
            '">Function</span>';
    }
    if (_.isArray(value)) {
        const list = [];
        let lastRank = 0;
        let textLong = 0;
        for (; lastRank < value.length; lastRank++) {
            const text = getPropValueHTML(value[lastRank], mode);
            if (textLong + text.length > 240 && mode === 'html') {
                break;
            }
            list.push(text);
            textLong += text.length;
        }
        if (list.length < value.length) {
            const hint = [];
            for (; lastRank < value.length; lastRank++) {
                const text = getPropValueHTML(value[lastRank], 'text');
                hint.push(text);
            }
            list.push('<span title="' + hint.join(',\n') + '">...</span>');
        }
        const wrap = list.length > 1 || textLong > 120 ? addIndent : _.identity;
        return '[' + wrap(list.join(',' + lineFeed)) + ']';
    }
    if (_.isObject(value)) {
        const list = [];
        let lastRank = 0;
        let textLong = 0;
        const pairs = _.toPairs(value);
        for (; lastRank < pairs.length; lastRank++) {
            const [k, v] = pairs[lastRank];
            const text = _.escape(k) + ': ' + getPropValueHTML(v, mode);
            if (textLong + text.length > 240 && mode === 'html') {
                break;
            }
            list.push(text);
            textLong += text.length;
        }
        if (list.length < _.size(value)) {
            const hint = [];
            for (; lastRank < pairs.length; lastRank++) {
                const [k, v] = pairs[lastRank];
                const text = _.escape(k) + ': ' + getPropValueHTML(v, 'text');
                hint.push(text);
            }
            list.push('<span title="' + hint.join('\n') + '">...</span>');
        }
        const wrap = list.length > 1 || textLong > 120 ? addIndent : _.identity;
        return '{ ' + wrap(list.join(',' + lineFeed)) + ' }';
    }
    return _.escape(JSON.stringify(value, null, ''));
}
class ErrorBoundary extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }
    static getDerivedStateFromError(error) {
        return { error };
    }
    render() {
        if (this.state.error) {
            return (_jsx("div", Object.assign({ className: 'playbook__error' }, { children: String(this.state.error) }), void 0));
        }
        return this.props.children;
    }
}
function getQueryParams() {
    return _.chain(window.location.search.replace(/^\?/, ''))
        .split('&')
        .compact()
        .map(part => {
        var _a;
        const [key, value] = part.split('=');
        return [key, (_a = window.decodeURIComponent(value)) !== null && _a !== void 0 ? _a : ''];
    })
        .fromPairs()
        .value();
}
function setQueryParams(params, replace) {
    const link = '?' +
        _.chain(Object.assign(Object.assign({}, getQueryParams()), params))
            .toPairs()
            .filter((pair) => !!pair[1])
            .map(([key, value]) => key + '=' + window.encodeURIComponent(value))
            .value()
            .join('&');
    if (replace) {
        window.history.replaceState(null, '', link);
    }
    else {
        window.history.pushState(null, '', link);
    }
}
export default Playbook;
