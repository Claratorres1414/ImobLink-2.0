import {View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator} from "react-native";
import {useAuthStore} from "../store/authStore";
import {getFeed} from "../apiServices/feedService";
import {useEffect, useState} from "react";
import {mapPostFromApi} from "../mappers/postMapper";
import PostCard from "../components/PostCard";

export default function FeedScreen() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadFeed() {
        try {
            const data = await getFeed()
            const mapped = Array.isArray(data.data)
                ? data.data.map(mapPostFromApi)
                : [];

            setPosts(mapped);
        } catch (error) {
            console.log('Erro ao carregar feed:', error);
        } finally {
            setLoading(false);
        }
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
                renderItem={({ item }) => <PostCard post={item} />}
            />
        </View>
    );
}