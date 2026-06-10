import {api} from "./api";

export async function followUser(userId: number) {
    return api.post(`/follow/${userId}`);
}

export async function unfollowUser(userId: number) {
    return api.delete(`/follow/unfollow/${userId}`);
}

export async function checkFollow(userId: number) {
    return api.get(`/follow/check/${userId}`);
}