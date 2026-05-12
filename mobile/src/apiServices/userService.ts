import { api } from "./api";

export async function getUserAccount(id: number) {
    try {
        const response = await api.get(
            `/user/getAccount/${id}`
        );

        return response.data;

    } catch (error) {
        console.log(
            "Erro ao buscar conta do usuário:",
            error
        );

        throw error;
    }
}