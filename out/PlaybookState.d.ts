declare global {
    interface Window {
        __playbookState?: Map<string, any>;
    }
}
export declare function setPlaybookState(name: string, value: any): void;
export declare function usePlaybookState<T = any>(name: string, defaultValue: T): T;
