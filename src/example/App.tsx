import React from 'react';
import { Provider } from 'react-redux';
import { createState, store } from '../index';
import { createRoot } from 'react-dom/client';


const counter = createState('counter', {});

function Logger() {
    counter.useWatch((state) => {
        console.log(state);
    });

    return null;
}


function Display() {
    return (
        <div style={{marginLeft: '45%', marginTop: '15%', fontSize:'24px', color: 'silver'}}>
            { counter.use()?.count ?? 'not init' }
        </div>
    );
}

function Updater() {
    React.useEffect(() => {
        const i = setInterval(() => {
            counter.set((state) => {
                if(!state.count) state.count = 0;
                state.count ++;
            });
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