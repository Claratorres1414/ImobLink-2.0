import { api } from "./api";

export async function likePost(postId: number) {
    return api.post(`/posts/like/${postId}`);
}

export async function unlikePost(postId: number) {
    return api.delete(`/posts/unlike/${postId}`);
}

export async function favPost(postId: number) {
    return api.post(`/posts/fav/${postId}`);
}

export async function unfavPost(postId: number) {
    return api.delete(`/posts/unfav/${postId}`);
}