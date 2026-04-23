const BASE_URL = 'http://100.110.9.1:8080'

export function getPostFirstImageUrl(postId: number) {
    return `${BASE_URL}/api/images/${postId}/post/thumb`;
}