import { create } from 'zustand';
import {api} from "../apiServices/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getUserInfo} from "../apiServices/userService";

type AuthState = {
    token: string | null;
    userId: number | null;
    loading: boolean;

    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    loadToken: () => Promise<void>;
    loadUserId: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    userId: null,
    loading: true,

    signIn: async (email, password) => {
        try {
            const response = await api.post('/auth/login', {
                email,
                password,
            });

            const token = response.data.data.token;

            await AsyncStorage.setItem('token', token);

            const profile = await getUserInfo();
            const userId = profile.data.id;

            await AsyncStorage.setItem('userId', String(userId));

            set({
                token,
                userId,
            })
        } catch (error) {
            console.log('Erro ao tentar fazer login:', error)
        }
    },

    signOut: async () => {
        await AsyncStorage.multiRemove([
            "token",
            "userId",
        ]);

        set({
            token: null,
            userId: null,
        });
    },
    loadToken: async () => {
        const token = await AsyncStorage.getItem('token');

        set({
            token,
            loading: false,
        });
    },

    loadUserId: async () => {
        const userId = await AsyncStorage.getItem('userId');

        set({
            userId: userId
                ? Number(userId)
                : null,
        });
    }
}));