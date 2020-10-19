"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_dom_1 = __importDefault(require("react-dom"));
var Playbook_1 = __importDefault(require("./Playbook"));
var PlaybookButton_1 = __importDefault(require("./PlaybookButton"));
require("./Playbook.less");
react_dom_1.default.render(react_1.default.createElement(Playbook_1.default, { pages: [
        {
            name: 'button',
            content: (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("button", null, "Button"),
                react_1.default.createElement("button", { disabled: true }, "Button")))
        },
        {
            name: 'input',
            content: (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("input", null),
                react_1.default.createElement("input", { disabled: true })))
        }
    ], contentWrapper: ContentWrapper, contentControl: react_1.default.createElement(PlaybookButton_1.default, null, "Dummy") }), document.getElementById('root'));
function ContentWrapper(props) {
    return react_1.default.createElement("main", null, props.children);
}
