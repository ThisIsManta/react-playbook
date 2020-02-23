import React from 'react';
export interface IPlaybookPage {
    name: string;
    content: React.ReactFragment;
}
export default function Playbook(props: {
    toolbar?: React.ReactNode;
    pages: Array<IPlaybookPage>;
}): JSX.Element;
