import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type DemoRole = 'guest' | 'staff' | 'admin' | 'verifier';

interface DemoState {
    role: DemoRole;
}

const initialState: DemoState = {
    role: 'guest',
};

const demoSlice = createSlice({
    name: 'demo',
    initialState,
    reducers: {
        setRole(state, action: PayloadAction<DemoRole>) {
            state.role = action.payload;
        },
    },
});

export const { setRole } = demoSlice.actions;
export default demoSlice.reducer;
