export type StatePlugin<T> = (args: {
    sliceName: string;
    getState: () => T;
    dispatch: any;
    initialState: T;
}) => void;