import React from 'react';
export interface IPlaybookPage {
    name: string;
    content: React.ReactFragment;
}
declare type Props = {
    toolbar?: React.ReactNode;
    pages: Array<IPlaybookPage>;
};
declare const _default: (props: Props) => JSX.Element;
export default _default;
export declare function getReactChildren(element: React.ReactFragment): Array<React.ReactElement>;
