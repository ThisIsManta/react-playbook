import { useEffect, useState } from 'react';
const __id = 'react-playbook';
window.__playbookState = new Map();
export function setPlaybookState(name, value) {
    window.__playbookState.set(name, value);
    for (const contentWindow of Array.from(window.frames)) {
        contentWindow.postMessage({ __id, name, value }, '*');
    }
}
export function usePlaybookState(name, defaultValue) {
    const [value, setValue] = useState(defaultValue);
    useEffect(() => {
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
        const onMessage = (e) => {
            if (e.data && e.data.__id === __id && e.data.name === name) {
                setValue(e.data.value);
            }
        };
        window.addEventListener('message', onMessage, false);
        return () => {
            window.removeEventListener('message', onMessage);
        };
    }, [name]);
    return value;
}
