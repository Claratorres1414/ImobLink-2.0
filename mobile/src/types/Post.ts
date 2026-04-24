export type Post = {
    id: number;
    imageUrl: string | null;
    description: string;
    price: number;
    street: string;
    number: string;
    createdAt: string;
    createdBy: string;
    likedTimes: number;
    views: number;
};