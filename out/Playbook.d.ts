import React from 'react';
export interface IPlaybookPage {
    name: string;
    content: React.ReactFragment;
}
declare type Props = {
    pages: Array<IPlaybookPage>;
    contentControl?: React.ComponentType | React.ReactElement;
    contentWrapper?: React.ComponentType<{
        children: React.ReactElement;
    }>;
};
declare const _default: React.MemoExoticComponent<(props: Props) => JSX.Element | null>;
export default _default;
export declare function PlaybookButton(props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>): JSX.Element;
export declare function getReactChildren(element: React.ReactFragment): Array<React.ReactElement>;
