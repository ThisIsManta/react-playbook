import React from 'react';
export type Storybook = {
    stories: {
        [name: string]: (_createLogger: typeof createLogger) => React.ReactElement;
    };
};
export declare function isStorybook(hash: any): hash is Storybook;
declare function createLogger(...params: any[]): void;
export declare function transformStorybook({ stories }: Storybook): React.ReactNodeArray;
export {};
