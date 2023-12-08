import React from 'react';
import { createRoot } from 'react-dom/client';
import Playbook from './Playbook';
import './Playbook.less';
createRoot(document.getElementById('root')).render(React.createElement(Playbook, { pages: [
        {
            name: 'button',
            content: (React.createElement(React.Fragment, null,
                React.createElement("button", null, "Button"),
                React.createElement("button", { disabled: true }, "Button")))
        },
        {
            name: 'input',
            content: {
                'default': React.createElement("input", null),
                'disabled': React.createElement("input", { disabled: true }),
            }
        }
    ], contentWrapper: ContentWrapper, contentControl: React.createElement(Playbook.Button, null, " Dummy") }));
function ContentWrapper(props) {
    return React.createElement("div", null, props.children);
}
