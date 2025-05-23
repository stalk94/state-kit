var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  createState: () => createState,
  default: () => index_default,
  store: () => store,
  useLocalStorage: () => persistPlugin
});
module.exports = __toCommonJS(index_exports);

// src/store.ts
var import_toolkit = require("@reduxjs/toolkit");
var asyncReducers = {};
var staticReducers = { __init__: (state = {}) => state };
var createRootReducer = () => (0, import_toolkit.combineReducers)({
  ...staticReducers,
  ...asyncReducers
});
var store = (0, import_toolkit.configureStore)({
  reducer: createRootReducer(),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      // игнорируем apply action
      ignoredActions: ["editor/apply"],
      ignoredPaths: ["payload"]
    }
  })
});
var registerReducer = (key, reducer) => {
  asyncReducers[key] = reducer;
  store.replaceReducer(createRootReducer());
};

// src/adapter.ts
var import_react_redux = require("react-redux");
var import_react = __toESM(require("react"), 1);
function getAtPath(obj, path) {
  return path.reduce((acc, key) => acc?.[key], obj);
}
function createTypedStateAdapter(sliceName, getLiveState, dispatch, setAction) {
  function createProxy(path = []) {
    const target = {};
    const proxy = new Proxy(target, {
      get(_, prop) {
        if (prop === "get") {
          return () => getAtPath(getLiveState(), path);
        }
        if (prop === "use") {
          return () => (0, import_react_redux.useSelector)((state) => getAtPath(state[sliceName], path));
        }
        if (prop === "set") {
          return (valueOrUpdater) => {
            dispatch(setAction((draft) => {
              if (path.length === 0) {
                if (typeof valueOrUpdater === "function") {
                  valueOrUpdater(draft);
                } else {
                  Object.assign(draft, valueOrUpdater);
                }
                return;
              }
              let parent = draft;
              for (let i = 0; i < path.length - 1; i++) {
                const key = path[i];
                if (typeof parent[key] !== "object" || parent[key] === null) {
                  parent[key] = {};
                }
                parent = parent[key];
              }
              const lastKey = path[path.length - 1];
              if (typeof valueOrUpdater === "function") {
                const result = valueOrUpdater(parent[lastKey]);
                if (typeof result !== "undefined") {
                  parent[lastKey] = result;
                }
              } else {
                parent[lastKey] = valueOrUpdater;
              }
            }));
          };
        }
        if (prop === "useWatch") {
          return (callback) => {
            import_react.default.useEffect(() => {
              let prev = getAtPath(getLiveState(), path);
              const unsubscribe = store.subscribe(() => {
                const next = getAtPath(getLiveState(), path);
                if (next !== prev) {
                  callback(next);
                  prev = next;
                }
              });
              return unsubscribe;
            }, []);
          };
        }
        return createProxy([...path, prop.toString()]);
      }
    });
    return proxy;
  }
  return createProxy();
}

// src/factory.ts
var import_toolkit2 = require("@reduxjs/toolkit");
function createStateSlice(name, initialState) {
  const slice = (0, import_toolkit2.createSlice)({
    name,
    initialState,
    reducers: {
      apply: (state, action) => {
        action.payload(state);
      }
    }
  });
  return {
    name,
    slice,
    reducer: slice.reducer,
    actions: slice.actions
  };
}

// src/plugins/persist.ts
function deepReplaceNulls(defaults, overrides) {
  if (typeof defaults !== "object" || defaults === null) return overrides ?? defaults;
  if (Array.isArray(defaults)) return Array.isArray(overrides) ? overrides : defaults;
  const result = {};
  for (const key in defaults) {
    const def = defaults[key];
    const over = overrides?.[key];
    if (over === null || typeof over === "undefined") {
      result[key] = def;
    } else if (typeof def === "object" && def !== null && typeof over === "object") {
      result[key] = deepReplaceNulls(def, over);
    } else {
      result[key] = over;
    }
  }
  return result;
}
function persistPlugin(options) {
  return ({ sliceName, getState, dispatch, initialState }) => {
    const localKey = options?.key ?? `statekit:${sliceName}`;
    if (options?.restore) {
      try {
        const raw = localStorage.getItem(localKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          const fixed = deepReplaceNulls(initialState, parsed);
          dispatch({
            type: `${sliceName}/apply`,
            payload: (draft) => {
              Object.assign(draft, fixed);
            }
          });
        }
      } catch (e) {
        console.warn(`[statekit] Failed to restore ${sliceName}`, e);
      }
    }
    let prev = getState();
    store.subscribe(() => {
      const current = getState();
      if (current !== prev) {
        prev = current;
        try {
          const data = JSON.stringify(current);
          setTimeout(() => {
            localStorage.setItem(localKey, data);
          }, 0);
        } catch (e) {
          console.warn(`[statekit] Failed to save ${sliceName}`, e);
        }
      }
    });
  };
}

// src/index.ts
function createState(name, initialState, plugins = []) {
  const slice = createStateSlice(name, initialState);
  registerReducer(name, slice.reducer);
  const adapter = createTypedStateAdapter(
    name,
    () => store.getState()[name],
    store.dispatch,
    slice.actions.apply
  );
  for (const plugin of plugins) {
    plugin({
      sliceName: name,
      getState: () => store.getState()[name],
      dispatch: store.dispatch,
      initialState
    });
  }
  return adapter;
}
var index_default = createState;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createState,
  store,
  useLocalStorage
});
//# sourceMappingURL=index.cjs.map