import { registerReducer, store } from './store';
import { createTypedStateAdapter } from './adapter';
import createSliceFactory from './factory';
export { store } from './store';
export { persistPlugin as useLocalStorage } from './plugins/persist';
import type { StatePlugin } from './plugins/type';



export function createState<T extends object>( name: string, initialState: T, plugins: StatePlugin<T>[] = []) {
    const slice = createSliceFactory(name, initialState);
    registerReducer(name, slice.reducer);

    const adapter = createTypedStateAdapter<T>(
        name,
        () => store.getState()[name] as T,
        store.dispatch,
        slice.actions.apply
    );

    for (const plugin of plugins) {
        plugin({
            sliceName: name,
            getState: () => store.getState()[name] as T,
            dispatch: store.dispatch,
            initialState
        });
    }

    return adapter;
}



export default createState;