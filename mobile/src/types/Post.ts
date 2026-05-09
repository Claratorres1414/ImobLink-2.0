export type Post = {
    id: number;
    imageUrl: string | null;
    description: string;
    price: number;
    street: string;
    avenue: string;
    number: string;
    createdAt: string;
    createdBy: string;
    likedTimes: number;
    views: number;
};