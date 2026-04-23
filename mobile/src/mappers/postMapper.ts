import { getPostFirstImageUrl } from "../utils/image";

export function mapPostFromApi(post: any) {
    return {
        id: post.id,
        description: post.description,
        imageUrl: getPostFirstImageUrl(post.id),
        price: post.price,
        street: post.street,
        number: post.number,
        likedTimes: post.likedTimes,
        views: post.views,
    };
}