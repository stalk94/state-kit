import React from 'react';
import { Provider } from 'react-redux';
import { createState, store, useLocalStorage } from './dist';
import { createRoot } from 'react-dom/client';


const editor = createState('editor', {
    layout: [],
    mod: 'block',
    size: { width: 100, height: 200 },
}, [
    useLocalStorage({ restore: true })
]);


function Test2() {
    const size = editor.size.use();

    return(
        <div style={{marginTop: '20px', color: 'red'}}>
            {/* or: editor?.size?.width.use() */}
            { size.width }                   
        </div>
    );
}

function Test({ }) {
    const size = editor.size.use();
    editor.size.height.useWatch(console.log)

    React.useEffect(() => {
        const i = setInterval(() => {
            editor.size.set((s) => {
                s.width = s.width+1
            });
        }, 1000);

        return () => clearInterval(i);
    }, []);


    return(
        <div>
            { size?.width }
            <Test2 />
        </div>
    );
}


function App() {
    return (
        <Provider store={store}>
            <div style={{ marginTop: '10%', marginLeft: '20%' }}>
                <Test />
            </div>
        </Provider>
    );
}


createRoot(document.querySelector(".root")).render(<App/>);