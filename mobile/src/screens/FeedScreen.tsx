import {View, FlatList, ActivityIndicator} from "react-native";
import {getFeed} from "../apiServices/feedService";
import {useEffect, useState} from "react";
import {mapPostFromApi} from "../mappers/postMapper";
import PostCard from "../components/PostCard";
import { api } from "../apiServices/api";
import { buildBase64Image } from "../utils/image";

export default function FeedScreen() {
    const [posts, setPosts] = useState<any[]>([]);
    const [images, setImages] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);

    async function loadFeed() {
        try {
            const data = await getFeed();
            const mapped = Array.isArray(data.data)
                ? data.data.map(mapPostFromApi)
                : [];

            setPosts(mapped);

            loadImages(mapped);
        } catch (error) {
            console.log('Erro ao carregar feed:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadImages(posts: any[]) {
        const newImages: Record<number, string> = {};

        await Promise.all(
            posts.map(async (post) => {
                try {
                    const response = await api.get(`/images/${post.id}/post/thumb`);
                    const base64 = response.data.data;

                    const imageUri = buildBase64Image(base64);

                    if (imageUri) {
                        newImages[post.id] = imageUri;
                    }
                } catch (error) {
                    console.log(`Erro ${error} ao carregar imagem do post: ${post.id}`);
                }
            })
        );
        setImages(newImages);
    }

    useEffect(() => {
        loadFeed();
    }, []);

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} />;
    }

    return (
        <View style={{ flex:1, padding:16 }}>
            <FlatList
                data={posts}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) =>
                    <PostCard
                        post={item}
                        imageUri={images[item.id]}
                    />}
            />
        </View>
    );
}