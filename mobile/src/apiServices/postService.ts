import { api } from "./api";

export async function likePost(postId: number) {
    return api.post(`/posts/like/${postId}`);
}

export async function unlikePost(postId: number) {
    return api.delete(`/posts/unlike/${postId}`);
}