import React from 'react';
export interface IPlaybookPage {
    name: string;
    content: React.ReactFragment | {
        [caption: string]: React.ReactElement;
    };
}
declare type Props = {
    pages: Array<IPlaybookPage>;
    contentControl?: React.ComponentType | React.ReactElement;
    contentWrapper?: React.ComponentType<{
        children: React.ReactElement;
    }>;
};
interface IPlaybook {
    (props: Props): React.ReactElement | null;
    Button: typeof Button;
}
declare const Playbook: IPlaybook;
declare function Button(props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>): JSX.Element;
export declare function getElements(content: IPlaybookPage['content']): Array<{
    caption?: string;
    element: React.ReactElement;
}>;
export default Playbook;
