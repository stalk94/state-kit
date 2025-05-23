import { store } from '../store';
import type { StatePlugin } from './type';


export function persistPluginOld<T>(options?: { key?: string; restore?: boolean }): StatePlugin<T> {
    return ({ sliceName, getState, dispatch }) => {
        const localKey = options?.key ?? `statekit:${sliceName}`;

        // ✅ Восстановление состояния
        if (options?.restore) {
            try {
                const raw = localStorage.getItem(localKey);
                if (raw) {
                    const parsed = JSON.parse(raw);

                    // диспатчим весь стейт, как draft-apply через immer
                    dispatch({
                        type: `${sliceName}/apply`,
                        payload: (draft: any) => {
                            Object.assign(draft, parsed);
                        }
                    });
                }
            } 
            catch (e) {
                console.warn(`[statekit] Failed to restore ${sliceName}`, e);
            }
        }

        // ✅ Подписка на изменения — сохраняем состояние
        let prev = getState();
        store.subscribe(() => {
            const current = getState();
            if (current !== prev) {
                prev = current;

                // сериализация и запись
                try {
                    const data = JSON.stringify(current);
                    
                    setTimeout(() => {
                        localStorage.setItem(localKey, data);
                    }, 0);
                } 
                catch (e) {
                    console.warn(`[statekit] Failed to save ${sliceName}`, e);
                }
            }
        });
    };
}

////////////////////////////////////////////////////////////////////////////

function deepReplaceNulls<T>(defaults: T, overrides: any): T {
    if (typeof defaults !== 'object' || defaults === null) return overrides ?? defaults;
    if (Array.isArray(defaults))  return (Array.isArray(overrides) ? overrides : defaults) as unknown as T;

    const result: any = {};

    for (const key in defaults) {
        const def = defaults[key];
        const over = overrides?.[key];

        if (over === null || typeof over === 'undefined') {
            result[key] = def;
        } 
        else if (typeof def === 'object' && def !== null && typeof over === 'object') {
            result[key] = deepReplaceNulls(def, over);
        } 
        else {
            result[key] = over;
        }
    }

    return result as T;
}


export function persistPlugin<T>(options?: { key?: string; restore?: boolean }): StatePlugin<T> {
    return ({ sliceName, getState, dispatch, initialState }) => {
        const localKey = options?.key ?? `statekit:${sliceName}`;

        if (options?.restore) {
            try {
                const raw = localStorage.getItem(localKey);
                if (raw) {
                    const parsed = JSON.parse(raw);

                    const fixed = deepReplaceNulls(initialState, parsed);

                    dispatch({
                        type: `${sliceName}/apply`,
                        payload: (draft: any) => {
                            Object.assign(draft, fixed);
                        }
                    });
                }
            } 
            catch (e) {
                console.warn(`[statekit] Failed to restore ${sliceName}`, e);
            }
        }

        // подписка на изменения
        let prev = getState();
        store.subscribe(() => {
            const current = getState();
            if (current !== prev) {
                prev = current;
                try {
                    const data = JSON.stringify(current);
                    setTimeout(() => {
                        localStorage.setItem(localKey, data);
                    }, 0);
                } 
                catch (e) {
                    console.warn(`[statekit] Failed to save ${sliceName}`, e);
                }
            }
        });
    };
}