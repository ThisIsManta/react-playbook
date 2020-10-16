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
function classNames() {
    var classes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        classes[_i] = arguments[_i];
    }
    return lodash_1.default.compact(classes).join(' ');
}
exports.default = react_1.default.memo(function (props) {
    var pages = react_1.useMemo(function () { return lodash_1.default.chain(props.pages)
        .uniqBy(function (page) { return page.name; })
        .sortBy(function (page) { return page.name; })
        .value(); }, [props.pages]);
    var path = window.decodeURI(window.location.pathname.replace(/^\//, ''));
    if (path !== '') {
        var page = pages.find(function (page) { return page.name === path; });
        if (!page) {
            return null;
        }
        var elements = getReactChildren(page.content);
        if (elements.length === 0) {
            return null;
        }
        var index = window.location.hash.replace(/^#/, '');
        var element = elements[index];
        if (!element) {
            return null;
        }
        return (react_1.default.createElement(ErrorBoundary, null, element));
    }
    return (react_1.default.createElement(ErrorBoundary, null,
        react_1.default.createElement(Playbook, __assign({}, props))));
});
function Playbook(props) {
    var _a = __read(react_1.useState(function () { return props.pages.find(function (page) { return page.name === getSearchQuery()['p']; }); }), 2), selectPage = _a[0], setSelectPage = _a[1];
    var _b = __read(react_1.useState(window.sessionStorage.getItem('playbook__searchText') || ''), 2), searchText = _b[0], setSearchText = _b[1];
    var onSearchBoxChange = react_1.useCallback(function (value) {
        setSearchText(value);
        window.sessionStorage.setItem('playbook__searchText', value);
    }, []);
    var searchPatterns = react_1.useMemo(function () { return lodash_1.default.words(searchText)
        .map(function (word) { return new RegExp(lodash_1.default.escapeRegExp(word), 'i'); }); }, [searchText]);
    var menus = react_1.useMemo(function () { return props.pages
        .filter(function (page) { return searchPatterns.length === 0 || searchPatterns.every(function (pattern) { return pattern.test(page.name); }); })
        .map(function (page) {
        var link = '?p=' + window.encodeURI(page.name);
        return (react_1.default.createElement("a", { key: page.name, className: classNames('playbook__menu__item', page === selectPage && '--select'), href: link, onClick: function (e) {
                e.preventDefault();
                window.history.pushState(null, '', link);
                setSelectPage(page);
            } }, page.name.split('/').map(function (part, rank, list) { return (rank === list.length - 1
            ? react_1.default.createElement("span", { key: rank, className: 'playbook__menu__item__last' }, part)
            : react_1.default.createElement("span", { key: rank },
                part,
                "/")); })));
    }); }, [props.pages, selectPage, searchPatterns]);
    return (react_1.default.createElement("div", { className: 'playbook' },
        react_1.default.createElement("link", { href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,600&family=Roboto+Mono:400,600&display=swap', rel: 'stylesheet' }),
        react_1.default.createElement("div", { className: 'playbook__left' },
            react_1.default.createElement("input", { className: 'playbook__search-box', type: 'text', placeholder: 'Search here', value: searchText, onChange: function (e) {
                    onSearchBoxChange(e.target.value);
                }, onKeyUp: function (e) {
                    if (e.key === 'Escape') {
                        onSearchBoxChange('');
                    }
                } }),
            react_1.default.createElement("div", { className: 'playbook__menu' }, menus)),
        react_1.default.createElement("div", { className: 'playbook__right' },
            react_1.default.createElement("div", { className: 'playbook__toolbar' }, props.toolbar),
            react_1.default.createElement("div", { className: 'playbook__contents' }, selectPage && react_1.default.createElement(Contents, { page: selectPage })))));
}
function Contents(props) {
    var elements = getReactChildren(props.page.content);
    if (elements.length === 0) {
        return (react_1.default.createElement("div", { className: 'playbook__error' },
            "Expected to render React elements, but found ",
            JSON.stringify(props.page.content),
            "."));
    }
    return (react_1.default.createElement(react_1.default.Fragment, null, elements.map(function (element, index) { return (react_1.default.createElement("section", { key: props.page.name + '#' + index, className: 'playbook__content' },
        react_1.default.createElement("iframe", { className: 'playbook__preview', src: '/' + window.encodeURI(props.page.name) + '#' + index, width: '100%', frameBorder: '0', scrolling: 'no', onLoad: function (e) {
                if (e.currentTarget.contentWindow) {
                    e.currentTarget.style.height = e.currentTarget.contentWindow.document.documentElement.scrollHeight + 'px';
                }
            } }),
        react_1.default.createElement("div", { className: 'playbook__property', dangerouslySetInnerHTML: { __html: getNodeHTML(element) } }))); })));
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
function getSearchQuery() {
    return lodash_1.default.chain(window.location.search.replace(/^\?/, ''))
        .split('&')
        .map(function (part) {
        var _a;
        var _b = __read(part.split('='), 2), key = _b[0], value = _b[1];
        return [key, (_a = window.decodeURIComponent(value), (_a !== null && _a !== void 0 ? _a : ''))];
    })
        .fromPairs()
        .value();
}
