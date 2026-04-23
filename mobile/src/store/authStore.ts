import { create } from 'zustand';

type AuthState = {
    token: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    token: null,

    signIn: async (email, password) => {
        set({ token: 'fake-token' });
        /*await new Promise((res) => setTimeout(res, 800));

        if (email && password) {

        }*/
    },

    signOut: () => set({ token: null }),
}));