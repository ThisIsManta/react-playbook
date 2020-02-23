"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
function isExportDefault(input) {
    return lodash_1.default.has(input, 'default');
}
exports.isExportDefault = isExportDefault;
