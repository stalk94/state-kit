import { useSelector } from 'react-redux';
import type { RootState } from './store';
import { store } from './store';
import React from 'react';
import type { Draft } from '@reduxjs/toolkit';

export type StateProxy<T> = {
    [K in keyof T]: StateProxy<T[K]>;
} & {
    get(): T;
    use(): T;
    set(value: T | ((draft: T) => void)): void;
    useWatch(callback: (value: T) => void): void;
};

function getAtPath(obj: any, path: string[]) {
    return path.reduce((acc, key) => acc?.[key], obj);
}



export function createTypedStateAdapter<T>(
    sliceName: string,
    getLiveState: () => T,
    dispatch: (action: any) => void,
    setAction: (payload: (draft: Draft<T>) => void) => any
): StateProxy<T> {
    function createProxy<P = T>(path: string[] = []): StateProxy<P> {
        const target: any = {};

        const proxy = new Proxy(target, {
            get(_, prop) {
                if (prop === 'get') {
                    return () => getAtPath(getLiveState(), path);
                }

                if (prop === 'use') {
                    return () => useSelector((state: RootState) => getAtPath(state[sliceName], path));
                }

                if (prop === 'set') {
                    return (valueOrUpdater: any | ((draft: any) => void)) => {
                        dispatch(setAction((draft: Draft<T>) => {
                            if (path.length === 0) {
                                if (typeof valueOrUpdater === 'function') {
                                    valueOrUpdater(draft);
                                } 
                                else {
                                    Object.assign(draft, valueOrUpdater);
                                }
                                return;
                            }

                            let parent = draft as any;
                            
                            for (let i = 0; i < path.length - 1; i++) {
                                const key = path[i];
                                if (typeof parent[key] !== 'object' || parent[key] === null) {
                                    parent[key] = {};
                                }
                                parent = parent[key];
                            }

                            const lastKey = path[path.length - 1];

                            if (typeof valueOrUpdater === 'function') {
                                const result = valueOrUpdater(parent[lastKey]);
                                if (typeof result !== 'undefined') {
                                    parent[lastKey] = result;
                                }
                            } 
                            else {
                                parent[lastKey] = valueOrUpdater;
                            }
                        }));
                    };
                }

                if (prop === 'useWatch') {
                    return (callback: (value: any) => void) => {
                        React.useEffect(() => {
                            let prev = getAtPath(getLiveState(), path);
                            
                            const unsubscribe = store.subscribe(() => {
                                const next = getAtPath(getLiveState(), path);
                                if (next !== prev) {
                                    callback(next);
                                    prev = next;
                                }
                            });
                            return unsubscribe;
                        }, []);
                    };
                }

                return createProxy([...path, prop.toString()]);
            }
        });

        return proxy as unknown as StateProxy<P>;
    }

    return createProxy();
}
