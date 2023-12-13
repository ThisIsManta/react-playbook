import React from 'react';
export interface IPlaybookPage {
    name: string;
    content: () => React.ReactElement;
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
    Catalog: typeof Catalog;
}
declare const Playbook: IPlaybook;
declare function Button({ active, ...props }: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    active?: boolean;
}): React.JSX.Element;
declare function Catalog(props: {
    children: Iterable<React.ReactElement>;
}): React.JSX.Element;
export default Playbook;
