import React from 'react';
import { Provider } from 'react-redux';
import { createState, store, useLocalStorage } from '../index';
import { createRoot } from 'react-dom/client';


const counter = createState('counter', { value: 0 });

// Pure watcher (not bound to any DOM)
function Logger() {
    counter.value.useWatch((v) => {
        console.log('[useWatch] value changed:', v)
    });

    return null;
}

// UI component that reacts to changes
function Display() {
    const value = counter.value.use();
    return <div>Value: {value}</div>;   // or even easier: <div>Value: {counter.value.use()}</div>
}

// Updates state every second
function Updater() {
    React.useEffect(() => {
        const i = setInterval(() => {
            counter.value.set(v => v + 1);
        }, 1000);
        return () => clearInterval(i);
    }, []);
    return null;
}

// Root component
export function App() {
    return (
        <Provider store={store}>
            <Logger />
            <Updater />
            <Display />
        </Provider>
    );
}

createRoot(document.querySelector(".root")).render(<App/>);