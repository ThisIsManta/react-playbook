import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom';
import Playbook from './Playbook';
import './Playbook.less';
ReactDOM.render(_jsx(Playbook, { pages: [
        {
            name: 'button',
            content: (_jsxs(React.Fragment, { children: [_jsx("button", { children: "Button" }, void 0), _jsx("button", Object.assign({ disabled: true }, { children: "Button" }), void 0)] }, void 0))
        },
        {
            name: 'input',
            content: {
                'default': _jsx("input", {}, void 0),
                'disabled': _jsx("input", { disabled: true }, void 0),
            }
        }
    ], contentWrapper: ContentWrapper, contentControl: _jsx(Playbook.Button, { children: " Dummy" }, void 0) }, void 0), document.getElementById('root'));
function ContentWrapper(props) {
    return _jsx("div", { children: props.children }, void 0);
}
