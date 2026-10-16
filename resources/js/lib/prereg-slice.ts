import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PreregState {
    step: number;
}

const initialState: PreregState = { step: 1 };

const preregSlice = createSlice({
    name: 'prereg',
    initialState,
    reducers: {
        setStep(state, action: PayloadAction<number>) {
            state.step = Math.max(1, Math.min(10, action.payload));
        },
    },
});

export const { setStep } = preregSlice.actions;
export default preregSlice.reducer;
