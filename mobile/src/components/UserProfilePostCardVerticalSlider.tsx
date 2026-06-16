import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "../navigation/types";
import {useNavigation} from "@react-navigation/native";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {api} from "../apiServices/api";
import {buildBase64Image} from "../utils/image";
import {FlatList, StyleSheet, View, ViewToken} from "react-native";
import MiniPostCard from "./MiniPostCard";

const CARD_WIDTH = 150;
const CARD_GAP = 12;
const PAIR_WIDTH = CARD_WIDTH * 2 + CARD_GAP;

type Props = {
    posts: any[];
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "PostDetails">;

export default function UserProfilePostCardVerticalSlider({ posts }: Props) {
    const navigation = useNavigation<NavigationProp>();
    const [images, setImages] = useState<Record<number, string[]>>({});
    const loadedIds = useRef<Set<number>>(new Set());

    useEffect(() => {
        loadedIds.current.clear();
        setImages({});
    }, [posts]);

    const pairs = posts.reduce<any[][]>((acc, post, i) => {
        if (i % 2 === 0) acc.push([post]);
        else acc[acc.length - 1].push(post);
        return acc;
    }, []);

    async function loadImagesForPost(post: any) {
        if (loadedIds.current.has(post.id)) return;
        loadedIds.current.add(post.id);

        try {
            const listResponse = await api.get(`/images/${post.id}/post/all`);
            const imageList = listResponse.data.data || [];

            const urls: string[] = [];
            await Promise.all(
                imageList.map(async (img: any) => {
                    try {
                        const imageResponse = await api.get(`/images/get/${img.id}`);
                        const uri = buildBase64Image(imageResponse.data.data);
                        if (uri) urls.push(uri);
                    } catch {}
                })
            );

            if (urls.length > 0) {
                setImages((prev) => ({ ...prev, [post.id]: urls }));
            }
        } catch {}
    }

    const onViewableItemsChanged = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            viewableItems.forEach((token) => {
                const pair: any[] = token.item;
                pair.forEach((post) => loadImagesForPost(post));
            });
        },
        []
    );

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 0,
    });

    return (
        <FlatList
            key={posts.map(p => p.id).join(',')}
            data={pairs}
            keyExtractor={(_, index) => String(index)}
            renderItem={({ item: pair }) => (
                <View style={styles.pair}>
                    {pair.map((post: any) => (
                        <MiniPostCard
                            key={post.id}
                            post={post}
                            images={images[post.id] || []}
                            onPress={() =>
                                navigation.navigate("PostDetails", { post })
                            }
                        />
                    ))}
                </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.container}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig.current}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 23,
        gap: CARD_GAP,
    },
    pair: {
        flexDirection: "row",
        gap: CARD_GAP,
    },
});