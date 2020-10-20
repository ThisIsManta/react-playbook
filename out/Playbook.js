"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var lodash_1 = __importDefault(require("lodash"));
var fuzzy_search_1 = __importDefault(require("fuzzy-search"));
var PlaybookButton_1 = __importDefault(require("./PlaybookButton"));
function classNames() {
    var classes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        classes[_i] = arguments[_i];
    }
    return lodash_1.default.compact(classes).join(' ');
}
var previewPathName = window.decodeURI(window.location.pathname.replace(/^\//, ''));
if (previewPathName) {
    document.body.classList.add('playbook__preview');
}
var darkMode = window.localStorage.getItem('playbook__dark-mode') === 'true';
if (darkMode) {
    document.body.classList.add('playbook__dark-mode');
}
exports.default = react_1.default.memo(function (props) {
    var pages = react_1.useMemo(function () { return lodash_1.default.chain(props.pages)
        .uniqBy(function (page) { return page.name; })
        .sortBy(function (page) { return page.name; })
        .value(); }, [props.pages]);
    if (previewPathName) {
        var page = pages.find(function (page) { return page.name === previewPathName; });
        if (!page) {
            return null;
        }
        var elements = getReactChildren(page.content);
        if (elements.length === 0) {
            return null;
        }
        var index = window.location.hash.replace(/^#/, '') || '0';
        var element = elements[index];
        if (!element) {
            return null;
        }
        return (react_1.default.createElement(ErrorBoundary, null, props.contentWrapper
            ? react_1.default.createElement(props.contentWrapper, null, element)
            : element));
    }
    return (react_1.default.createElement(ErrorBoundary, null,
        react_1.default.createElement(Playbook, __assign({}, props, { pages: pages }))));
});
function Playbook(props) {
    var getSelectPage = react_1.useCallback(function () { return props.pages.find(function (page) { return page.name === getQueryParams()['p']; }); }, [props.pages]);
    var getSearchText = react_1.useCallback(function () { return getQueryParams()['q'] || ''; }, []);
    var _a = __read(react_1.useState(getSelectPage), 2), selectPage = _a[0], setSelectPage = _a[1];
    var _b = __read(react_1.useState(getSearchText), 2), searchText = _b[0], setSearchText = _b[1];
    react_1.useEffect(function () {
        var firstPage = props.pages[0];
        if (selectPage === undefined && firstPage) {
            setQueryParams({ p: firstPage.name }, true);
            setSelectPage(firstPage);
        }
    }, [props.pages]);
    react_1.useEffect(function () {
        window.addEventListener('popstate', function () {
            setSelectPage(getSelectPage());
            setSearchText(getSearchText());
        });
    }, []);
    react_1.useEffect(function () {
        setQueryParams({ q: searchText }, true);
    }, [searchText]);
    var searcher = react_1.useMemo(function () { return new fuzzy_search_1.default(props.pages, ['name'], { caseSensitive: false, sort: true }); }, [props.pages]);
    var _c = __read(react_1.useState(false), 2), leftMenuVisible = _c[0], setLeftMenuVisible = _c[1];
    var _d = __read(react_1.useState(true), 2), propertyPanelVisible = _d[0], setPropertyPanelVisible = _d[1];
    var onMenuItemClick = react_1.useCallback(function (pageName) {
        setSelectPage(props.pages.find(function (page) { return page.name === pageName; }));
        setQueryParams({ p: pageName }, false);
        setLeftMenuVisible(false);
    }, [props.pages]);
    var menus = react_1.useMemo(function () { return searcher.search(searchText).map(function (page) {
        var _a;
        return (react_1.default.createElement(MenuItemMemoized, { name: page.name, selected: page.name === ((_a = selectPage) === null || _a === void 0 ? void 0 : _a.name), onClick: onMenuItemClick }));
    }); }, [searcher, searchText, selectPage]);
    return (react_1.default.createElement("div", { className: 'playbook' },
        react_1.default.createElement("link", { href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,600&family=Roboto+Mono:400,600&display=swap', rel: 'stylesheet' }),
        react_1.default.createElement("div", { className: classNames('playbook__left', leftMenuVisible && 'playbook__left-responsive'), tabIndex: -1, onKeyUp: function (e) {
                if (e.key === 'Escape') {
                    setLeftMenuVisible(false);
                }
            } },
            react_1.default.createElement("input", { className: 'playbook__search-box', type: 'text', placeholder: 'Search here', value: searchText, onChange: function (e) {
                    setSearchText(e.target.value);
                }, onKeyUp: function (e) {
                    if (e.key === 'Escape' && searchText !== '') {
                        setSearchText('');
                        e.stopPropagation();
                    }
                } }),
            react_1.default.createElement("div", { className: 'playbook__menu' }, menus)),
        react_1.default.createElement("div", { className: 'playbook__right' },
            react_1.default.createElement("div", { className: 'playbook__toolbar' },
                react_1.default.createElement(PlaybookButton_1.default, { id: 'playbook__side-menu-toggle', title: 'Open navigation menu', onClick: function () { setLeftMenuVisible(function (value) { return !value; }); } },
                    react_1.default.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" },
                        react_1.default.createElement("path", { d: "M0 0h24v24H0z", fill: "none" }),
                        react_1.default.createElement("path", { d: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" }))),
                react_1.default.isValidElement(props.contentControl) || !props.contentControl
                    ? props.contentControl
                    : react_1.default.createElement(props.contentControl, null),
                react_1.default.createElement("div", { style: { flex: '1 1 auto' } }),
                react_1.default.createElement(PlaybookButton_1.default, { title: 'Toggle dark mode', onClick: function () {
                        if (darkMode) {
                            window.localStorage.removeItem('playbook__dark-mode');
                        }
                        else {
                            window.localStorage.setItem('playbook__dark-mode', 'true');
                        }
                        window.location.reload();
                    } }, darkMode
                    ? react_1.default.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" },
                        react_1.default.createElement("path", { d: "M0 0h24v24H0z", fill: "none" }),
                        react_1.default.createElement("path", { d: "M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" }))
                    : react_1.default.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" },
                        react_1.default.createElement("path", { d: "M0 0h24v24H0z", fill: "none" }),
                        react_1.default.createElement("path", { d: "M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z" }))),
                react_1.default.createElement(PlaybookButton_1.default, { id: 'playbook__property-panel-toggle', title: propertyPanelVisible ? 'Hide property panel' : 'Show property panel', onClick: function () { setPropertyPanelVisible(function (value) { return !value; }); } }, propertyPanelVisible
                    ? react_1.default.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" },
                        react_1.default.createElement("path", { d: "M0 0h24v24H0z", fill: "none" }),
                        react_1.default.createElement("path", { d: "M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" }))
                    : react_1.default.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24" },
                        react_1.default.createElement("path", { d: "M0 0h24v24H0z", fill: "none" }),
                        react_1.default.createElement("path", { d: "M23 21.74l-1.46-1.46L7.21 5.95 3.25 1.99 1.99 3.25l2.7 2.7h-.64c-1.11 0-1.99.89-1.99 2l-.01 11c0 1.11.89 2 2 2h15.64L21.74 23 23 21.74zM22 7.95c.05-1.11-.84-2-1.95-1.95h-4V3.95c0-1.11-.89-2-2-1.95h-4c-1.11-.05-2 .84-2 1.95v.32l13.95 14V7.95zM14.05 6H10V3.95h4.05V6z" })))),
            react_1.default.createElement("div", { className: 'playbook__contents' }, selectPage && (react_1.default.createElement(ContentsMemoized, { page: selectPage, propertyPanelVisible: propertyPanelVisible }))))));
}
var MenuItemMemoized = react_1.default.memo(MenuItem);
function MenuItem(props) {
    return (react_1.default.createElement("a", { className: classNames('playbook__menu__item', props.selected && '--select'), href: '?p=' + window.encodeURI(props.name), onClick: function (e) {
            e.preventDefault();
            props.onClick(props.name);
        } }, props.name.split('/').map(function (part, rank, list) { return (rank === list.length - 1
        ? react_1.default.createElement("span", { key: rank, className: 'playbook__menu__item__last' }, part)
        : react_1.default.createElement("span", { key: rank },
            part,
            "/")); })));
}
var ContentsMemoized = react_1.default.memo(Contents);
function Contents(props) {
    var elements = getReactChildren(props.page.content);
    if (elements.length === 0) {
        return (react_1.default.createElement("div", { className: 'playbook__error' },
            "Expected to render React elements, but found ",
            JSON.stringify(props.page.content),
            "."));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null, elements.map(function (element, index) {
        var link = '/' + window.encodeURI(props.page.name) + '#' + index;
        return (react_1.default.createElement("section", { key: props.page.name + '#' + index, className: 'playbook__content' },
            react_1.default.createElement("div", { className: 'playbook__content-container' },
                react_1.default.createElement("iframe", { "data-playbook-content": true, src: link, width: '100%', frameBorder: '0', scrolling: 'no', onLoad: function (e) {
                        if (e.currentTarget.contentWindow) {
                            e.currentTarget.style.height = e.currentTarget.contentWindow.document.documentElement.scrollHeight + 'px';
                        }
                    } }),
                react_1.default.createElement(PlaybookButton_1.default, { id: 'playbook__new-window', title: 'Open in a new tab', onClick: function () { window.open(link, '_blank'); } },
                    react_1.default.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", "enable-background": "new 0 0 24 24", viewBox: "0 0 24 24" },
                        react_1.default.createElement("rect", { fill: "none", height: "24", width: "24" }),
                        react_1.default.createElement("path", { d: "M9,5v2h6.59L4,18.59L5.41,20L17,8.41V15h2V5H9z" })))),
            props.propertyPanelVisible && (react_1.default.createElement("div", { className: 'playbook__property', dangerouslySetInnerHTML: { __html: getNodeHTML(element) } }))));
    })));
}
function getReactChildren(element) {
    if (lodash_1.default.isArray(element)) {
        return Δ(element);
    }
    if (react_1.default.isValidElement(element)) {
        if (element.type === react_1.default.Fragment) {
            var fragment = element;
            if (lodash_1.default.isArray(fragment.props.children)) {
                return Δ(fragment.props.children);
            }
            else {
                return Δ([fragment.props.children]);
            }
        }
        return [element];
    }
    return [];
}
exports.getReactChildren = getReactChildren;
function Δ(elements) {
    return elements.filter(react_1.default.isValidElement);
}
function getNodeHTML(node) {
    if (!node || node === true) {
        return '';
    }
    if (typeof node === 'string' || typeof node === 'number') {
        return lodash_1.default.escape(String(node));
    }
    if (Array.isArray(node)) {
        return node.map(getNodeHTML).join('');
    }
    if (react_1.default.isValidElement(node)) {
        var tagName = "<span class=\"playbook__property__tag\">" + lodash_1.default.escape(getTagName(node)) + "</span>";
        var _a = node.props, children = _a.children, attributes = __rest(_a, ["children"]);
        var outerHTML = lodash_1.default.escape('<') + tagName;
        outerHTML += lodash_1.default.map(attributes, function (value, name) {
            var openingQuote = typeof value === 'string' ? '' : '{';
            var closingQuote = typeof value === 'string' ? '' : '}';
            return ("<div class=\"playbook__property__indent\">" + lodash_1.default.escape(name) + "=" + openingQuote + getPropValueHTML(value, 'html') + closingQuote + "</div>");
        }).join('');
        var innerHTML = getNodeHTML(children);
        if (innerHTML) {
            outerHTML += lodash_1.default.escape('>') + innerHTML + lodash_1.default.escape('</') + tagName + lodash_1.default.escape('>');
        }
        else {
            outerHTML += lodash_1.default.escape('/>');
        }
        return '<div class="playbook__property__indent">' + outerHTML + '</div>';
    }
    console.warn('Found an unrecognized node type:', node);
    return '';
}
function getTagName(element) {
    if (element.type === react_1.default.Fragment) {
        return 'Fragment';
    }
    if (typeof element.type === 'string') {
        return element.type;
    }
    return (lodash_1.default.get(element, 'type.displayName') ||
        lodash_1.default.get(element, 'type.name') ||
        lodash_1.default.get(element, 'type.constructor.name') ||
        'Untitled');
}
function getPropValueHTML(value, mode) {
    var _a;
    var lineFeed = mode === 'html' ? '<br/>' : '\n';
    var addIndent = function (text) {
        if (mode === 'html') {
            return '<div class="playbook__property__indent">' + text + '</div>';
        }
        return '\n' + text.split(/\r?\n/).map(function (line) { return '  ' + line; }).join('\n') + '\n';
    };
    if (react_1.default.isValidElement(value)) {
        return getNodeHTML(value);
    }
    if (lodash_1.default.isFunction(value)) {
        if (mode === 'text') {
            return 'Function';
        }
        var list = String(value).split(/\r?\n/);
        var indent_1 = new RegExp((_a = '^' + lodash_1.default.chain(list)
            .map(function (line) { return line.replace(/\t/g, '  ').match(/^\s+/); })
            .compact()
            .map(function (_a) {
            var _b = __read(_a, 1), match = _b[0];
            return match;
        })
            .minBy(function (match) { return match.length; })
            .value(), (_a !== null && _a !== void 0 ? _a : '')));
        var text = list.map(function (line) { return line.replace(indent_1, ''); }).join('\n');
        return '<span class="playbook__property__function" title="' +
            lodash_1.default.escape(text) +
            '">Function</span>';
    }
    if (lodash_1.default.isArray(value)) {
        var list = [];
        var lastRank = 0;
        var textLong = 0;
        for (; lastRank < value.length; lastRank++) {
            var text = getPropValueHTML(value[lastRank], mode);
            if (textLong + text.length > 240 && mode === 'html') {
                break;
            }
            list.push(text);
            textLong += text.length;
        }
        if (list.length < value.length) {
            var hint = [];
            for (; lastRank < value.length; lastRank++) {
                var text = getPropValueHTML(value[lastRank], 'text');
                hint.push(text);
            }
            list.push('<span title="' + hint.join(',\n') + '">...</span>');
        }
        var wrap = list.length > 1 || textLong > 120 ? addIndent : lodash_1.default.identity;
        return '[' + wrap(list.join(',' + lineFeed)) + ']';
    }
    if (lodash_1.default.isObject(value)) {
        var list = [];
        var lastRank = 0;
        var textLong = 0;
        var pairs = lodash_1.default.toPairs(value);
        for (; lastRank < pairs.length; lastRank++) {
            var _b = __read(pairs[lastRank], 2), k = _b[0], v = _b[1];
            var text = lodash_1.default.escape(k) + ': ' + getPropValueHTML(v, mode);
            if (textLong + text.length > 240 && mode === 'html') {
                break;
            }
            list.push(text);
            textLong += text.length;
        }
        if (list.length < lodash_1.default.size(value)) {
            var hint = [];
            for (; lastRank < pairs.length; lastRank++) {
                var _c = __read(pairs[lastRank], 2), k = _c[0], v = _c[1];
                var text = lodash_1.default.escape(k) + ': ' + getPropValueHTML(v, 'text');
                hint.push(text);
            }
            list.push('<span title="' + hint.join('\n') + '">...</span>');
        }
        var wrap = list.length > 1 || textLong > 120 ? addIndent : lodash_1.default.identity;
        return '{ ' + wrap(list.join(',' + lineFeed)) + ' }';
    }
    return lodash_1.default.escape(JSON.stringify(value, null, ''));
}
var ErrorBoundary = (function (_super) {
    __extends(ErrorBoundary, _super);
    function ErrorBoundary(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {};
        return _this;
    }
    ErrorBoundary.getDerivedStateFromError = function (error) {
        return { error: error };
    };
    ErrorBoundary.prototype.render = function () {
        if (this.state.error) {
            return (react_1.default.createElement("div", { className: 'playbook__error' }, String(this.state.error)));
        }
        return this.props.children;
    };
    return ErrorBoundary;
}(react_1.default.PureComponent));
function getQueryParams() {
    return lodash_1.default.chain(window.location.search.replace(/^\?/, ''))
        .split('&')
        .compact()
        .map(function (part) {
        var _a;
        var _b = __read(part.split('='), 2), key = _b[0], value = _b[1];
        return [key, (_a = window.decodeURIComponent(value), (_a !== null && _a !== void 0 ? _a : ''))];
    })
        .fromPairs()
        .value();
}
function setQueryParams(params, replace) {
    var link = '?' +
        lodash_1.default.chain(__assign(__assign({}, getQueryParams()), params))
            .toPairs()
            .filter(function (pair) { return !!pair[1]; })
            .map(function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            return key + '=' + window.encodeURIComponent(value);
        })
            .value()
            .join('&');
    if (replace) {
        window.history.replaceState(null, '', link);
    }
    else {
        window.history.pushState(null, '', link);
    }
}
