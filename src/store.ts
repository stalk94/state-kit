import { configureStore, combineReducers, Reducer } from '@reduxjs/toolkit';

const asyncReducers: Record<string, Reducer> = {};
const staticReducers = { __init__: (state = {}) => state, };


const createRootReducer = () =>
    combineReducers({
        ...staticReducers,
        ...asyncReducers,
    });


export const store = configureStore({
    reducer: createRootReducer(),
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        }),
});


export const registerReducer = (key: string, reducer: Reducer) => {
    asyncReducers[key] = reducer;
    store.replaceReducer(createRootReducer());
};


export type RootState = ReturnType<typeof store.getState>;