import {View, FlatList, ActivityIndicator} from "react-native";
import {getFeed} from "../apiServices/feedService";
import {useEffect, useState} from "react";
import {mapPostFromApi} from "../mappers/postMapper";
import PostCard from "../components/PostCard";
import { api } from "../apiServices/api";
import { buildBase64Image } from "../utils/image";
import { useNavigation } from "@react-navigation/native";
import {RootStackParamList} from "../navigation/types";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";

type FeedNavigationProp =
    NativeStackNavigationProp<
        RootStackParamList,
        "Feed"
    >;

export default function FeedScreen() {
    const [posts, setPosts] = useState<any[]>([]);
    const [images, setImages] = useState<Record<number, string[]>>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [visiblePosts, setVisiblePosts] = useState<number[]>([]);

    const navigation = useNavigation<FeedNavigationProp>();

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

    async function loadImages(posts: any[]) {
        const newImages: Record<number, string[]> = {};

        await Promise.all(
            posts
                .filter((post) => visiblePosts.includes(post.id))
                .map(async (post) => {
                    try {
                        const listResponse = await api.get(
                            `/images/${post.id}/post/all`
                        );

                        const imageList = listResponse.data.data || [];

                        const urls: string[] = [];

                        await Promise.all(
                            imageList.map(async (img: any) => {
                                try {
                                    const imageResponse = await api.get(
                                        `/images/get/${img.id}`
                                    );

                                    const base64 = imageResponse.data.data;

                                    const imageUri = buildBase64Image(base64);

                                    if (imageUri) {
                                        urls.push(imageUri);
                                    }

                                } catch (err) {
                                    console.log(
                                        `Erro imagem ${img.id}:`,
                                        err
                                    );
                                }
                            })
                        );

                        if (urls.length > 0) {
                            newImages[post.id] = urls;
                        }

                    } catch (error) {
                        console.log(
                            `Erro ao carregar imagens do post ${post.id}`,
                            error
                        );
                    }
                })
        );

        setImages((prev) => ({
            ...prev,
            ...newImages
        }));
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
        if (visiblePosts.length > 0 && posts.length > 0) {
            loadImages(posts);
        }
    }, [visiblePosts, posts]);

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
                        images={images[item.id] || []}
                        onPress={() =>
                            navigation.navigate("PostDetails", {
                                postId: item.id
                            })
                        }
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