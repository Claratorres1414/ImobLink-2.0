import { api } from "./api";

type RegiterPayload = {
    cpf: string;
    phoneNumber: string;
    name: string
    email: string;
    password: string;
};

export async function registerUser(payload: RegiterPayload) {
    const response = await api.post("/auth/register", payload);
    return response.data
}