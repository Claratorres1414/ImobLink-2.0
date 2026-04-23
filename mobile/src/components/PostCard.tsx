import { Image, Text, View, StyleSheet } from "react-native";

export default function PostCard ({ post }: any) {
    return (
        <View style={styles.card}>
            {post.imageUrl && (
                <Image source={{ uri: post.imageUrl }} style={styles.image} />
            )}

            <View style={styles.content}>
                <Text style={styles.price}>R$ {post.price}</Text>
                <Text style={styles.location}>{post.street}, {post.number}</Text>
                <Text numberOfLines={2} style={styles.description}>{post.description}</Text>

                <View style={styles.metrics}>
                    <Text>Likes: {post.likedTimes}</Text>
                    <Text>Views: {post.views}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',

        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },

        elevation: 3,

    },
    image: { width:'100%', height:200 },
    content: {padding: 12,},
    price: {
        fontSize: 18,
        fontWeight:'bold',
        marginBottom: 4,
    },
    location: {
        color: '#666',
        marginBottom: 6,
    },

    description: {
        color: '#333',
        marginBottom: 8,
    },

    metrics: {
        flexDirection:'row',
        justifyContent:'space-between',
        padding:8
    }
});