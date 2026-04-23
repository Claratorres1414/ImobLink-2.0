import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://100.110.9.1:8080/api',
});