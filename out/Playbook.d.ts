import React from 'react';
export interface IPlaybookPage {
    name: string;
    content: React.ReactElement | {
        [caption: string]: React.ReactElement;
    } | (() => React.ReactElement);
}
type Props = {
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
declare function Button({ active, ...props }: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    active?: boolean;
}): React.JSX.Element;
export declare function getElements(content: IPlaybookPage['content']): Array<{
    caption?: string;
    element: React.ReactElement;
}>;
export default Playbook;
