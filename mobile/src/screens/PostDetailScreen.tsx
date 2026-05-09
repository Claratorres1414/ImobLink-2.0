import {View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Heart, MessageCircle, Phone, Star } from "lucide-react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {getPostImages} from "../apiServices/imageService";
import React, {useEffect, useRef, useState} from "react";

const { width } = Dimensions.get("window");

type Props = {
    route: RouteProp<
        RootStackParamList,
        "PostDetails"
    >;
};

type NavigationProps =
    NativeStackNavigationProp<
        RootStackParamList,
        "PostDetails"
    >;

export default function PostDetailScreen({route}: Props) {
    const navigation =
        useNavigation<NavigationProps>();

    const {post} = route.params;

    const [images, setImages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);

    async function loadImages() {
        try {
            const urls = await getPostImages(post.id);

            setImages(urls);
        } catch (error) {
            console.log(
                "Erro ao carregar imagens na postagem detalhada:",
                error
            );
        }
    }

    useEffect(() => {
        loadImages();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                activeOpacity={0.7}
                onPress={() => {
                    setTimeout(() => {
                        navigation.reset({
                            index: 0,
                            routes: [{name: "Feed"}],
                        });
                    }, 100);
                }}
            >
                <ArrowLeft size={30} color="#A3C3FF"/>
            </TouchableOpacity>

            <View style={styles.header}>

                <View style={styles.userInfo}>
                    <Image
                        source={require("../assets/default_profile.jpg")}
                        style={styles.avatar}
                    />

                    <Text style={styles.username}>
                        user
                    </Text>
                </View>

                <TouchableOpacity style={styles.followButton}>
                    <Text style={styles.followText}>
                        Seguir
                    </Text>
                </TouchableOpacity>
            </View>
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
                                width
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

            <View style={styles.actionsContainer}>
                <View style={styles.leftActions}>
                    <TouchableOpacity activeOpacity={0.7}>
                        <Heart size={28} color="#7D92D4" />
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.7}>
                        <MessageCircle size={28} color="#7D92D4" />
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.7}>
                        <Phone size={28} color="#7D92D4" />
                    </TouchableOpacity>
                </View>

                <View style={styles.rightActions}>
                    <TouchableOpacity activeOpacity={0.7}>
                        <Star size={28} color="#7D92D4"/>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    backButton: {
        marginLeft: 24,
        marginTop: 16,
        width: 44,
        height: 44,
        justifyContent: "center",
    },

    header: {
        marginTop: 10,
        marginHorizontal: 24,

        height: 74,

        flexDirection: "row",
        alignItems: "flex-start",
    },

    userInfo: {
        flexDirection: "row",
        alignItems: "center",
    },

    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,

        elevation: 4,
    },

    username: {
        marginLeft: 12,
        marginTop: -12,

        fontSize: 18,
        fontWeight: "600",
        color: "#7D92D4",
    },

    followButton: {
        marginLeft: "auto",

        marginTop: 7,

        width: 70,
        height: 32,

        borderRadius: 7,

        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "#FF8C42",
    },

    followText: {
        color: "#E9E9E9",
        fontWeight: "600",
    },
    image: {
        width,
        height: 350,
        resizeMode: "cover",
    },
    dotsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
        backgroundColor: "#D9D9D9",
    },
    activeDot: {
        backgroundColor: "#7D92D4",
    },
    actionsContainer: {
        marginTop: 5,

        marginHorizontal: 24,

        flexDirection: "row",
        alignItems: "center",
    },

    leftActions: {
        flexDirection: "row",
        alignItems: "center",

        gap: 18,
    },

    rightActions: {
        marginLeft: "auto"
    }
});