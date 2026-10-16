import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import demoReducer from './demo-slice';
import preregReducer from './prereg-slice';

const rootReducer = combineReducers({
    demo: demoReducer,
    prereg: preregReducer,
    [api.reducerPath]: api.reducer,
});

export function makeStore() {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefault) => getDefault().concat(api.middleware),
    });
}

export const store = makeStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
