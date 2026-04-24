const BASE_URL = 'http://100.110.9.1:8080'

export function getPostFirstImageUrl(postId: number) {
    return `${BASE_URL}/api/images/${postId}/post/thumb`;
}

export function buildBase64Image(base64?: string) {
    if (!base64) return undefined;
    return `data:image/jpeg;base64,${base64}`;
}