import { api } from "./api";
import { buildBase64Image } from "../utils/image";

export async function getPostImages(
    postId: number
): Promise<string[]> {

    try {
        const listResponse = await api.get(
            `/images/${postId}/post/all`
        );

        const imageList =
            listResponse.data.data || [];

        const urls: string[] = [];

        await Promise.all(
            imageList.map(async (img: any) => {

                const imageResponse = await api.get(
                    `/images/get/${img.id}`
                );

                const base64 =
                    imageResponse.data.data;

                const imageUri =
                    buildBase64Image(base64);

                if (imageUri) {
                    urls.push(imageUri);
                }
            })
        );

        return urls;

    } catch (error) {

        console.log(
            "Erro ao carregar imagens:",
            error
        );

        return [];
    }
}

export async function getProfileImage(
    imageId: number | null
) : Promise<string | null> {
    if (!imageId) {
        return null;
    }

    try {
        const response = await api.get(
            `/images/get/${imageId}`
        );

        const base64 = response.data.data;

        const imageUri = buildBase64Image(base64)

        return imageUri || null;
    } catch (error) {
        console.log(
            "Erro ao carregar imagem do perfil:",
            error
        );

        return null;
    }
}