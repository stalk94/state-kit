import { Draft, createSlice, PayloadAction } from '@reduxjs/toolkit';

type SetFnPayload<T> = (draft: Draft<T>) => void;


export default function createStateSlice<T extends object>(name: string, initialState: T) {
    const slice = createSlice({
        name,
        initialState,
        reducers: {
            apply: (state, action: PayloadAction<SetFnPayload<T>>) => {
                action.payload(state);
            }
        },
    });

    return {
        name,
        slice,
        reducer: slice.reducer,
        actions: slice.actions,
    };
}
