"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var __id = 'react-playbook';
window.__playbookState = new Map();
function setPlaybookState(name, value) {
    var e_1, _a;
    window.__playbookState.set(name, value);
    try {
        for (var _b = __values(Array.from(window.frames)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var contentWindow = _c.value;
            contentWindow.postMessage({ __id: __id, name: name, value: value }, '*');
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
exports.setPlaybookState = setPlaybookState;
function usePlaybookState(name, defaultValue) {
    var _a = __read(react_1.useState(defaultValue), 2), value = _a[0], setValue = _a[1];
    react_1.useEffect(function () {
        var _a, _b;
        if (window.opener && ((_a = window.opener.__playbookState) === null || _a === void 0 ? void 0 : _a.has(name))) {
            setValue(window.opener.__playbookState.get(name));
        }
        else if (window.parent && ((_b = window.parent.__playbookState) === null || _b === void 0 ? void 0 : _b.has(name))) {
            setValue(window.parent.__playbookState.get(name));
        }
        else {
            setValue(defaultValue);
        }
        var onMessage = function (e) {
            if (e.data && e.data.__id === __id && e.data.name === name) {
                setValue(e.data.value);
            }
        };
        window.addEventListener('message', onMessage, false);
        return function () {
            window.removeEventListener('message', onMessage);
        };
    }, [name]);
    return value;
}
exports.usePlaybookState = usePlaybookState;
