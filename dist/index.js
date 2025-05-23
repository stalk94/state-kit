// src/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
var asyncReducers = {};
var staticReducers = { __init__: (state = {}) => state };
var createRootReducer = () => combineReducers({
  ...staticReducers,
  ...asyncReducers
});
var store = configureStore({
  reducer: createRootReducer(),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  })
});
var registerReducer = (key, reducer) => {
  asyncReducers[key] = reducer;
  store.replaceReducer(createRootReducer());
};

// src/adapter.ts
import { useSelector } from "react-redux";
import React from "react";
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
          return () => useSelector((state) => getAtPath(state[sliceName], path));
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
            React.useEffect(() => {
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
import { createSlice } from "@reduxjs/toolkit";
function createStateSlice(name, initialState) {
  const slice = createSlice({
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
export {
  createState,
  index_default as default,
  store,
  persistPlugin as useLocalStorage
};
//# sourceMappingURL=index.js.map