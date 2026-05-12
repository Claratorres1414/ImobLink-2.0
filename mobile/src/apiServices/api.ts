import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

export const api = axios.create({
    baseURL: 'http://100.110.9.1:8080/api',
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});