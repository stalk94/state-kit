# statekit

💡 Hookstate-like API built on top of Redux Toolkit with nested access, typed `.get()`, `.set()`, `.use()` and powerful plugin system.

## Features

- 🔁 `.get()`, `.set()`, `.use()` and `.useWatch()` on any nested path
- ⚛️ Fully typed reactive access
- 📦 Redux DevTools compatible
- 🔌 Plugin system: persist, logger, custom
- 🧩 Modular, scalable, predictable

## Usage

```ts
const editor = createState('editor', {
  mod: 'block',
  size: { width: 100, height: 200 },
}, [
  persistPlugin({ restore: true, watch: true }),
  loggerPlugin(),
]);

editor.mod.set('grid');
editor.size.width.useWatch((value) => {
  console.log('width changed:', value);
});