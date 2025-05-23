import * as _reduxjs_toolkit from '@reduxjs/toolkit';
import * as redux_thunk from 'redux-thunk';
import * as redux from 'redux';

type StateProxy<T> = {
    [K in keyof T]: StateProxy<T[K]>;
} & {
    get(): T;
    use(): T;
    set(value: T | ((draft: T) => void)): void;
    useWatch(callback: (value: T) => void): void;
};

declare const store: _reduxjs_toolkit.EnhancedStore<{
    __init__: {};
}, redux.Action<string>, _reduxjs_toolkit.Tuple<[redux.StoreEnhancer<{
    dispatch: redux_thunk.ThunkDispatch<{
        __init__: {};
    }, undefined, redux.UnknownAction>;
}>, redux.StoreEnhancer]>>;

type StatePlugin<T> = (args: {
    sliceName: string;
    getState: () => T;
    dispatch: any;
    initialState: T;
}) => void;

declare function persistPlugin<T>(options?: {
    key?: string;
    restore?: boolean;
}): StatePlugin<T>;

declare function createState<T extends object>(name: string, initialState: T, plugins?: StatePlugin<T>[]): StateProxy<T>;

export { createState, createState as default, store, persistPlugin as useLocalStorage };
