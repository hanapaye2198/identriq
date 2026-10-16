import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
    token: string | null;
}

const initialState: WalletState = {
    token: typeof localStorage !== 'undefined' ? localStorage.getItem('wallet_token') : null,
};

const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        setToken(state, action: PayloadAction<string | null>) {
            state.token = action.payload;
            if (typeof localStorage !== 'undefined') {
                if (action.payload) localStorage.setItem('wallet_token', action.payload);
                else localStorage.removeItem('wallet_token');
            }
        },
    },
});

export const { setToken } = walletSlice.actions;
export default walletSlice.reducer;
