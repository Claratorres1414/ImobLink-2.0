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
    const [refreshing, setRefreshing] = useState(false);
    const [visiblePosts, setVisiblePosts] = useState<number[]>([]);

    const onViewableItemsChanged = ({ viewableItems }: any) => {
        const ids = viewableItems.map((item: any) => item.item.id);
        setVisiblePosts(ids);
    }

    async function loadFeed() {
        try {
            const data = await getFeed();
            const mapped = Array.isArray(data.data)
                ? data.data.map(mapPostFromApi)
                : [];

            setPosts(mapped);
            setImages({});
        } catch (error) {
            console.log('Erro ao carregar feed:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadImages() {
        const newImages: Record<number, string> = {};

        await Promise.all(
            visiblePosts.map(async (postId) => {
                if (images[postId]) return;

                try {
                    const response= await api.get(`/images/${postId}/post/thumb`);
                    const base64 = response.data.data;

                    const imageUri = buildBase64Image(base64);

                    if (imageUri) {
                        newImages[postId] = imageUri;
                    }
                } catch (error) {
                    console.log(`Erro ao carregar imagem do post: ${postId}`);
                }
            })
        );
        if (Object.keys(newImages).length > 0) {
            setImages((prev) => ({
                ...prev,
                ...newImages
            }));
        }
    }

    async function onRefresh() {
        setRefreshing(true);
        await loadFeed();
        setRefreshing(false);
    }

    useEffect(() => {
       loadFeed();
    }, []);

    useEffect(() => {
        if (visiblePosts.length > 0) {
            loadImages();
        }
    }, [visiblePosts]);

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} />;
    }

    return (
        <View style={{ flex:1, padding:16 }}>
            <FlatList
                data={posts}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        imageUri={images[item.id]}
                    />
                )}
                refreshing={refreshing}
                onRefresh={onRefresh}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
            />
        </View>
    );
}