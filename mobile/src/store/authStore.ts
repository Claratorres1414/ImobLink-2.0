import { create } from 'zustand';
import {api} from "../apiServices/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthState = {
    token: string | null;
    loading: boolean;

    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    loadToken: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    loading: true,

    signIn: async (email, password) => {
        try {
            const response = await api.post('/auth/login', {
                email,
                password,
            });

            const token = response.data.data.token;

            await AsyncStorage.setItem('token', token);

            set({ token })
        } catch (error) {
            console.log('Erro ao tentar fazer login:', error)
        }
    },

    signOut: async () => {
        await AsyncStorage.removeItem('token');
        set({ token: null });
    },

    loadToken: async () => {
        const token = await AsyncStorage.getItem('token');

        set({
            token,
            loading: false,
        });
    },
}));