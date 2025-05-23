# state-kit

💡 StateKit is a convenient state management tool built on top of Redux Toolkit.
It provides a simple, reactive API for accessing deeply nested state using .get(), .set(), and .use() —
as if you're working with a plain object, but with full reactivity, type safety, and plugin support.


## ✨ In short:
* You write state.user.profile.name.set(...) — and the state updates  
* You call state.user.profile.name.use() — and the component automatically subscribes to changes  
* Under the hood, it's powered by Redux + Immer + React — but you never deal with the complexity yourself


## Features
- 🔁 `.get()`, `.set()`, `.use()` and `.useWatch()` on any nested path
- ⚛️ Fully typed reactive access
- 📦 Redux DevTools compatible
- 🔌 Plugin system: persist, logger, custom
- 🧩 Modular, scalable, predictable


## Usage

```ts
import React from 'react';
import { Provider } from 'react-redux';
import { createState, store, useLocalStorage } from 'state-kit';


// create slice
const editor = createState('editor', {
    layout: [],
    mod: 'block',
    size: { width: 100, height: 200 },
});


// test presentation component 2
function Test2() {
    const size = editor.size.use();

    return(
        <div style={{marginTop: '20px', color: 'red'}}>
            {/* or: editor?.size?.width.use() */}
            { size.width }                   
        </div>
    );
}
// test presentation component 1
function Test({ }) {
    const size = editor.size.use();
    editor.size.height.useWatch(console.log)

    React.useEffect(() => {
         const i = setInterval(() => {
            editor.size.width.set((prev) => prev + 1);
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

// root point init
function App() {
    return (
        <Provider store={store}>
            <div style={{ marginTop: '10%', marginLeft: '20%' }}>
                <Test />
            </div>
        </Provider>
    );
}

```

### .set() usage examples
🔢 For primitive values (e.g. number, string, boolean)  
You must return the new value:
```ts
// primitive: number
editor.size.width.set((prevWidth) => prevWidth + 1);
```

🧱 For objects or arrays  
You can mutate the draft directly:
```ts
editor.size.set((prevSize) => {
    prevSize.width += 1;
    prevSize.height += 10;

    // optional: can return draft, but not required
    return prevSize;
});
```

## Persist local storage plugin

```ts
import { createState, useLocalStorage } from 'state-kit';

// 👇 Creates reactive state with auto-persist
const editor = createState('editor', {
    layout: [],
    mod: 'block',
    size: { width: 100, height: 200 },
}, [
    useLocalStorage({ restore: true }) // ✅ auto-restore from localStorage
]);

```


