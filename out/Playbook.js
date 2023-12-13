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
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import get from 'lodash/get';
import escape from 'lodash/escape';
import isObject from 'lodash/isObject';
import identity from 'lodash/identity';
import compact from 'lodash/compact';
import uniqBy from 'lodash/uniqBy';
import sortBy from 'lodash/sortBy';
import minBy from 'lodash/minBy';
import FuzzySearch from './FuzzySearch';
function classNames(...classes) {
    return classes.filter((item) => typeof item === 'string').map(item => item.trim()).join(' ');
}
const previewPageName = getQueryParams().r;
if (!previewPageName) {
    document.body.classList.add('playbook__theater');
}
else {
    if (!document.title) {
        document.title = previewPageName;
    }
    if (window.parent !== window.self) {
        document.body.classList.add('playbook__preview');
    }
}
const darkMode = window.localStorage.getItem('playbook__dark-mode') === 'true';
if (darkMode) {
    document.body.classList.add('playbook__dark-mode');
}
const Playbook = function Playbook(props) {
    const pages = useMemo(() => sortBy(uniqBy(props.pages, page => page.name), page => page.name), [props.pages]);
    if (previewPageName) {
        const page = pages.find(page => page.name === previewPageName);
        if (!page || typeof page.content !== 'function') {
            return null;
        }
        const Content = page.content;
        const ContentWrapper = props.contentWrapper || PassThroughContentWrapper;
        return (React.createElement(ErrorBoundary, null,
            React.createElement(ContentWrapper, null,
                React.createElement(React.Suspense, null,
                    React.createElement(Content, null)))));
    }
    return (React.createElement(ErrorBoundary, null,
        React.createElement(Index, Object.assign({}, props, { pages: pages }))));
};
Playbook.Button = Button;
Playbook.Catalog = Catalog;
function Index(props) {
    const getSelectPage = useCallback(() => props.pages.find(page => page.name === getQueryParams()['p']), [props.pages]);
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
        if (selectPage) {
            document.title = selectPage.name;
        }
    }, [selectPage]);
    useEffect(() => {
        setQueryParams({ q: searchText }, true);
    }, [searchText]);
    const searcher = useMemo(() => new FuzzySearch(props.pages, ['name'], { caseSensitive: false, sort: true }), [props.pages]);
    const [leftMenuVisible, setLeftMenuVisible] = useState(false);
    const onMenuItemClick = useCallback((pageName) => {
        setSelectPage(props.pages.find(page => page.name === pageName));
        setQueryParams({ p: pageName }, false);
        setLeftMenuVisible(false);
    }, [props.pages]);
    const menus = useMemo(() => {
        const results = searcher.search(searchText);
        if (results.length === 0) {
            return (React.createElement("div", { className: 'playbook__no-results' },
                React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", height: "20px", viewBox: "0 0 24 24", width: "20px" },
                    React.createElement("g", null,
                        React.createElement("path", { d: "M0,0h24v24H0V0z", fill: "none" })),
                    React.createElement("g", null,
                        React.createElement("path", { d: "M2.81,2.81L1.39,4.22l2.27,2.27C2.61,8.07,2,9.96,2,12c0,5.52,4.48,10,10,10c2.04,0,3.93-0.61,5.51-1.66l2.27,2.27 l1.41-1.41L2.81,2.81z M12,20c-4.41,0-8-3.59-8-8c0-1.48,0.41-2.86,1.12-4.06l10.94,10.94C14.86,19.59,13.48,20,12,20z M7.94,5.12 L6.49,3.66C8.07,2.61,9.96,2,12,2c5.52,0,10,4.48,10,10c0,2.04-0.61,3.93-1.66,5.51l-1.46-1.46C19.59,14.86,20,13.48,20,12 c0-4.41-3.59-8-8-8C10.52,4,9.14,4.41,7.94,5.12z" })))));
        }
        return results.map(page => (React.createElement(MenuItemMemoized, { key: page.name, name: page.name, selected: page.name === (selectPage === null || selectPage === void 0 ? void 0 : selectPage.name), onClick: onMenuItemClick })));
    }, [searcher, searchText, selectPage]);
    const selectLink = selectPage ? '/?r=' + window.encodeURIComponent(selectPage.name) : null;
    return (React.createElement("div", { className: 'playbook' },
        React.createElement("link", { href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,600&family=Roboto+Mono:400,600&display=swap', rel: 'stylesheet' }),
        React.createElement("div", { className: classNames('playbook__left', leftMenuVisible && 'playbook__left-responsive'), tabIndex: -1, onKeyUp: e => {
                if (e.key === 'Escape') {
                    setLeftMenuVisible(false);
                }
            } },
            React.createElement("div", { className: 'playbook__search-box' },
                React.createElement("svg", { className: 'playbook__search-icon', xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" },
                    React.createElement("path", { d: "M0 0h24v24H0z", fill: "none" }),
                    React.createElement("path", { d: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" })),
                React.createElement("input", { type: 'text', value: searchText, placeholder: 'Search', onChange: e => {
                        setSearchText(e.target.value);
                    }, onKeyUp: e => {
                        if (e.key === 'Escape' && searchText !== '') {
                            setSearchText('');
                            e.stopPropagation();
                        }
                    } })),
            React.createElement("div", { className: 'playbook__menu' }, menus)),
        React.createElement("div", { className: 'playbook__right' },
            React.createElement("div", { className: 'playbook__toolbar' },
                React.createElement(Button, { id: 'playbook__side-menu-toggle', title: 'Open navigation menu', onClick: () => { setLeftMenuVisible(value => !value); } },
                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" },
                        React.createElement("path", { d: "M0 0h24v24H0z", fill: "none" }),
                        React.createElement("path", { d: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" }))),
                typeof props.contentControl === 'function'
                    ? React.createElement(props.contentControl, null)
                    : props.contentControl,
                React.createElement("div", { style: { flex: '1 1 auto' } }),
                React.createElement(Button, { title: 'Toggle dark mode', active: darkMode, onClick: () => {
                        if (darkMode) {
                            window.localStorage.removeItem('playbook__dark-mode');
                        }
                        else {
                            window.localStorage.setItem('playbook__dark-mode', 'true');
                        }
                        window.location.reload();
                    } },
                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", height: "24px", viewBox: "0 0 24 24", width: "24px" },
                        React.createElement("rect", { fill: "none", height: "24", width: "24" }),
                        React.createElement("path", { d: "M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36c-0.98,1.37-2.58,2.26-4.4,2.26 c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z" }))),
                selectLink && (React.createElement(Button, { title: 'Open in a new tab', onClick: () => { window.open(selectLink, '_blank'); } },
                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", height: "24px", viewBox: "0 0 24 24", width: "24px" },
                        React.createElement("rect", { fill: "none", height: "24", width: "24" }),
                        React.createElement("polygon", { points: "21,11 21,3 13,3 16.29,6.29 6.29,16.29 3,13 3,21 11,21 7.71,17.71 17.71,7.71" }))))),
            selectLink && (React.createElement("iframe", { className: 'playbook__content-container', "data-playbook-content": true, src: selectLink, width: '100%', frameBorder: '0' })))));
}
const MenuItemMemoized = React.memo(MenuItem);
function MenuItem(props) {
    return (React.createElement("a", { className: classNames('playbook__menu__item', props.selected && '--select'), href: '?p=' + window.encodeURI(props.name), onClick: e => {
            e.preventDefault();
            props.onClick(props.name);
        } }, props.name.split(/\\|\//).map((part, rank, list) => (rank === list.length - 1
        ? React.createElement("span", { key: rank, className: 'playbook__menu__item__last' }, part)
        : React.createElement("span", { key: rank },
            part,
            "/")))));
}
function PassThroughContentWrapper(props) {
    return props.children;
}
function Button(_a) {
    var { active } = _a, props = __rest(_a, ["active"]);
    return (React.createElement("button", Object.assign({}, props, { className: classNames('playbook__button', active && 'playbook__button__active', props.className) })));
}
function Catalog(props) {
    const elements = React.Children.toArray(props.children).map((element, index) => {
        var _a, _b;
        return (React.createElement("section", { key: index, className: 'playbook__catalog' },
            React.isValidElement(element) && /^\.\$/.test(element.key || '') && (React.createElement("header", { className: 'playbook__catalog__caption' },
                React.createElement("svg", { className: 'playbook__catalog__caption__icon', xmlns: "http://www.w3.org/2000/svg", height: "24", viewBox: "0 -960 960 960", width: "24" },
                    React.createElement("path", { d: "M685-128v-418H329l146 146-74 74-273-273 273-273 74 74-146 146h462v524H685Z" })), (_b = (_a = element.key) === null || _a === void 0 ? void 0 : _a.match(/^\.\$(.+)/)) === null || _b === void 0 ? void 0 :
                _b[1])),
            React.createElement("div", { className: 'playbook__catalog__columns' },
                React.createElement("div", { className: 'playbook__catalog__property', dangerouslySetInnerHTML: { __html: getNodeHTML(element) } }),
                React.createElement("div", { className: 'playbook__catalog__content' }, element))));
    });
    return React.createElement(React.Fragment, null, elements);
}
function getNodeHTML(node) {
    if (!node || node === true) {
        return '';
    }
    if (typeof node === 'string' || typeof node === 'number') {
        return escape(String(node));
    }
    if (Array.isArray(node)) {
        return node.map(getNodeHTML).join('');
    }
    if (React.isValidElement(node)) {
        const tagName = `<span class="playbook__property__tag">${escape(getTagName(node))}</span>`;
        const _a = node.props, { children } = _a, attributes = __rest(_a, ["children"]);
        let outerHTML = escape('<') + tagName;
        outerHTML += Object.entries(attributes).map(([name, value]) => {
            const openingQuote = typeof value === 'string' ? '' : '{';
            const closingQuote = typeof value === 'string' ? '' : '}';
            return (`<div class="playbook__property__indent">${escape(name)}=${openingQuote}${getPropValueHTML(value, 'html')}${closingQuote}</div>`);
        }).join('');
        const innerHTML = getNodeHTML(children);
        if (innerHTML) {
            outerHTML += escape('>') + '<div class="playbook__property__indent">' + innerHTML + '</div>' + escape('</') + tagName + escape('>');
        }
        else {
            outerHTML += escape('/>');
        }
        return outerHTML;
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
    return (get(element, 'type.displayName') ||
        get(element, 'type.name') ||
        (get(element, 'type.constructor.name') === 'Function' && get(element, 'type.constructor.name')) ||
        'Untitled');
}
function getPropValueHTML(value, mode) {
    const lineFeed = mode === 'html' ? '<br/>' : '\n';
    const addIndent = (text) => {
        if (mode === 'html') {
            return '<div class="playbook__property__indent">' + text + '</div>';
        }
        return '\n' + text.split(/\r?\n/).map(line => '  ' + line).join('\n') + '\n';
    };
    if (React.isValidElement(value)) {
        return '<div class="playbook__property__indent">' + getNodeHTML(value) + '</div>';
    }
    if (typeof value === 'function') {
        if (mode === 'text') {
            return 'Function';
        }
        const list = String(value).split(/\r?\n/);
        const indent = new RegExp('^' + (minBy(compact(list.map(line => get(line.replace(/\t/g, '  ').match(/^\s+/), 0))), match => match.length) || ''));
        const text = list.map(line => line.replace(indent, '')).join('\n');
        return '<span class="playbook__property__function" title="' +
            escape(text) +
            '">Function</span>';
    }
    if (Array.isArray(value)) {
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
        const wrap = list.length > 1 || textLong > 120 ? addIndent : identity;
        return '[' + wrap(list.join(',' + lineFeed)) + ']';
    }
    if (isObject(value)) {
        const list = [];
        let lastRank = 0;
        let textLong = 0;
        const pairs = Object.entries(value);
        for (; lastRank < pairs.length; lastRank++) {
            const [k, v] = pairs[lastRank];
            const text = escape(k) + ': ' + getPropValueHTML(v, mode);
            if (textLong + text.length > 240 && mode === 'html') {
                break;
            }
            list.push(text);
            textLong += text.length;
        }
        if (list.length < Object.keys(value).length) {
            const hint = [];
            for (; lastRank < pairs.length; lastRank++) {
                const [k, v] = pairs[lastRank];
                const text = escape(k) + ': ' + getPropValueHTML(v, 'text');
                hint.push(text);
            }
            list.push('<span title="' + hint.join('\n') + '">...</span>');
        }
        const wrap = list.length > 1 || textLong > 120 ? addIndent : identity;
        return '{ ' + wrap(list.join(',' + lineFeed)) + ' }';
    }
    return escape(JSON.stringify(value, null, ''));
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
            return (React.createElement("div", { className: 'playbook__error' }, String(this.state.error)));
        }
        return this.props.children;
    }
}
function getQueryParams() {
    return Object.fromEntries(compact(window.location.search.replace(/^\?/, '')
        .split('&')).map(part => {
        var _a;
        const [key, value] = part.split('=');
        return [key, (_a = window.decodeURIComponent(value)) !== null && _a !== void 0 ? _a : ''];
    }));
}
function setQueryParams(params, replace) {
    const link = '?' +
        Object.entries(Object.assign(Object.assign({}, getQueryParams()), params))
            .filter((pair) => !!pair[1])
            .map(([key, value]) => key + '=' + window.encodeURIComponent(value))
            .join('&');
    if (replace) {
        window.history.replaceState(null, '', link);
    }
    else {
        window.history.pushState(null, '', link);
    }
}
export default Playbook;
