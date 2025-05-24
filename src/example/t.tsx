import React from 'react';
import { Provider } from 'react-redux';
import { createState, store, useLocalStorage } from 'statekit-react';


const editor = createState('editor', {
    layout: [],
    mod: 'block',
    size: { width: 100, height: 200 },
});

function Test(props) {
  const size = editor.size.use();
  editor.size.useWatch((newSize)=> console.log('size was changed:', newSize));

  return(
    <div>
        { size.width } x {size.height}
    </div>
  );
}
// anywhere, don't limit yourself to just components
editor.size.set({width: 600, height: 800});

export default function App() {
  return (
    <Provider store={store}>
      <h1>💪 statekit-react</h1>
      <Test />
    </Provider>
  );
}