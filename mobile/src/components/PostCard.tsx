import { Image, Text, View, StyleSheet, ScrollView, Dimensions } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity } from "react-native";

const { width } = Dimensions.get("window");

type Props = {
    post: any,
    images?: string[];
    onPress?: () => void;
};

function PostCard({ post, images = [], onPress }: Props) {
    const scrollRef = useRef<ScrollView | null>(null);

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images?.length <= 1) return;

        const interval = setInterval(() => {
            const nextIndex =
                currentIndex === images.length - 1
                    ? 0
                    : currentIndex + 1;

            scrollRef.current?.scrollTo({
                x: nextIndex * (width - 32),
                y: 0,
                animated: true
            });

            setCurrentIndex(nextIndex);
        }, 3000);

        return () => clearInterval(interval);
    }, [currentIndex, images]);

    return (
        <TouchableOpacity
            activeOpacity={0.95}
            onPress={onPress}
        >
            <View style={styles.card}>
                {images.length > 0 && (
                    <View>
                        <ScrollView
                            ref={scrollRef}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(event) => {
                                const slide =
                                    Math.round(
                                        event.nativeEvent.contentOffset.x /
                                        (width - 32)
                                    );
                                setCurrentIndex(slide)
                            }}
                        >
                            {images.map((uri, index) => (
                                <Image
                                    key={`${post.id}-${index}`}
                                    source={{ uri }}
                                    style={styles.image}
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
                                            currentIndex === index && styles.activeDot
                                        ]}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
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
        </TouchableOpacity>
    );
}

export default React.memo(PostCard);

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
    image: {
        width: width - 32,
        height:350
    },
    dotsContainer: {
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
        flexDirection: 'row',
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: 4,
    },

    activeDot: {
        backgroundColor: '#fff',
    },
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