import React, { useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CARD_WIDTH = 150;
const CARD_HEIGHT = 200;
const IMAGE_HEIGHT = 110;

type Props = {
    post: any;
    images?: string[];
    onPress?: () => void;
};

function MiniPostCard({ post, images = [], onPress }: Props) {
    const scrollRef = useRef<ScrollView | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    return (
        <TouchableOpacity
            activeOpacity={0.95}
            onPress={onPress}
            style={styles.cardWrapper}
        >
            <View style={styles.card}>
                {images.length > 0 && (
                    <View>
                        <ScrollView
                            ref={scrollRef}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(e) => {
                                const slide = Math.round(
                                    e.nativeEvent.contentOffset.x / CARD_WIDTH
                                );
                                setCurrentIndex(slide);
                            }}
                        >
                            {images.map((uri, index) => (
                                <Image
                                    key={`${post.id}-${index}`}
                                    source={{ uri }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            ))}
                        </ScrollView>

                        {images.length > 1 && (
                            <View style={styles.dotsContainer}>
                                {images.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.dot,
                                            currentIndex === index && styles.activeDot,
                                        ]}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.content}>
                    <Text style={styles.price} numberOfLines={1}>
                        R$ {post.price}
                    </Text>
                    <Text numberOfLines={1} style={styles.location}>
                        {post.avenue}, {post.street}, {post.number}
                    </Text>
                    <Text numberOfLines={1} style={styles.description}>
                        {post.description}
                    </Text>
                    <View style={styles.metrics}>
                        <Text style={styles.metricsText}>Likes: {post.likedTimes}</Text>
                        <Text style={styles.metricsText}>Views: {post.views}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default React.memo(MiniPostCard);

const styles = StyleSheet.create({
    cardWrapper: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 10,
        backgroundColor: "#fff",
        borderWidth: 0.5,
        borderColor: "rgba(0,0,0,0.08)",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    card: {
        flex: 1,
        borderRadius: 10,
        overflow: "hidden",
    },
    image: {
        width: CARD_WIDTH,
        height: IMAGE_HEIGHT,
    },
    dotsContainer: {
        position: "absolute",
        bottom: 6,
        alignSelf: "center",
        flexDirection: "row",
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.5)",
        marginHorizontal: 2,
    },
    activeDot: {
        backgroundColor: "#fff",
    },
    content: {
        padding: 8,
        gap: 4,
    },
    price: {
        fontSize: 13,
        fontWeight: "700",
        color: "#333D52",
    },
    location: {
        fontSize: 11,
        color: "#666",
    },
    description: {
        fontSize: 11,
        fontFamily: "Inter-SemiBold",
        fontWeight: "200",
        color: "#333",
    },
    metrics: {
        flexDirection:'row',
        justifyContent:'space-between',
    },
    metricsText: {
        marginTop: "auto",
        fontFamily: "Inter",
        fontSize: 10,
    }
});