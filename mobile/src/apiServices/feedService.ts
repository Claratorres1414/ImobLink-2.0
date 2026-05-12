import { api } from "./api";

export async function getFeed() {
    const response = await api.get('/feed');
    return response.data;
}