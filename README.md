# state-kit

💡 **StateKit** is a convenient state management tool built on top of Redux Toolkit.  
It provides a simple, reactive API for accessing deeply nested state using `.get()`, `.set()`, and `.use()` —  
as if you're working with a plain object, but with full reactivity, type safety, and plugin support.

---

## ✨ In short:

- You write `state.user.profile.name.set(...)` — and the state updates  
- You call `state.user.profile.name.use()` — and the component automatically subscribes to changes  
- Under the hood, it's powered by **Redux + Immer + React** — but you never deal with the complexity yourself

---

## 🚀 Features

- 🔁 `.get()`, `.set()`, `.use()` and `.useWatch()` on any nested path  
- ⚛️ Fully typed reactive access  
- 📦 Redux DevTools compatible  
- 🔌 Plugin system: persist, logger, custom  
- 🧩 Modular, scalable, predictable  

---

## 📦 Full install (if you're starting from scratch)

```bash
npm install statekit-react react react-dom react-redux @reduxjs/toolkit
```

---

## 📦 Installation (if you already use React and Redux Toolkit)

If your project already uses `react`, `@reduxjs/toolkit`, and `react-redux`,  
you can simply install **state-kit** as a lightweight, plugin-ready state manager:

```bash
# Using npm
npm install statekit-react

# Using yarn
yarn add statekit-react

# Using pnpm
pnpm add statekit-react
```

---

## 🧪 Usage

```ts
import React from 'react';
import { Provider } from 'react-redux';
import { createState, store, useLocalStorage } from 'statekit-react';

// create slice state
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
```

---

### 🧮 `.set()` usage examples

#### 🔢 For primitive values (e.g. number, string, boolean)  
You must return the new value:

```ts
// create
const editor = createState('editor', {
    size: { width: 100, height: 200 },
});

// primitive: number
editor.size.width.set((prevWidth) => prevWidth + 1);
```

#### 🧱 For objects or arrays  
You can mutate the draft directly:

```ts
// create
const editor = createState('editor', {
    size: { width: 100, height: 200 },
});

editor.size.set((prevSize) => {
    prevSize.width += 1;
    prevSize.height += 10;

    // optional: can return draft, but not required
    return prevSize;
});
```

---

## 💾 Persist local storage plugin

```ts
import { createState, useLocalStorage } from 'statekit-react';

// 👇 Creates reactive state with auto-persist
const editor = createState('editor', {
    layout: [],
    size: { width: 100, height: 200 },
}, [
    useLocalStorage({ restore: true }) // ✅ auto-restore from localStorage
]);
```