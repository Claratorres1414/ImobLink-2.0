import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "../navigation/types";

import Tabbar from "../components/Tabbar";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import React, {useCallback, useEffect, useState} from "react";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import { Phone, Mail } from 'lucide-react-native';
import {getUserInfo} from "../apiServices/userService";
import {getMyFavs, getMyPosts} from "../apiServices/postService";
import {mapPostFromApi} from "../mappers/postMapper";
import MiniPostCardSlider from "../components/MiniPostCardSlider";

type MyProfileNavigationProp =
    NativeStackNavigationProp<
        RootStackParamList,
        "MyProfile"
    >;

export default function MyProfileScreen() {
    const navigation = useNavigation<MyProfileNavigationProp>();
    const insets = useSafeAreaInsets();

    const [user, setUser] = useState<any>(null);
    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [myFavs, setMyFavs] = useState<any[]>([]);
    const [profileImage, setProfileImage] =
        useState<string | null>(null);

    async function loadUserInfo() {
        try {
            const data = await getUserInfo();

            setUser(data.data);
        } catch (error) {
            console.log(
                "Erro ao carregar usuário:",
                error
            );
        }
    }

    async function loadMyPosts() {
        try {
            const data = await getMyPosts();
            const mapped = Array.isArray(data.data)
                ? data.data.map(mapPostFromApi)
                : [];

            setMyPosts(mapped)
        } catch (error) {
            console.log(
                "Erro ao carregar posts do usuário:",
                error
            )
        }
    }

    async function loadMyFavs() {
        try {
            const data = await getMyFavs();
            const mapped = Array.isArray(data.data)
                ? data.data.map(mapPostFromApi)
                : [];

            setMyFavs(mapped)
        } catch (error) {
            console.log(
                "Erro ao carregar posts favoritos do usuário:",
                error
            )
        }
    }

    useFocusEffect(
        useCallback(() => {
            loadUserInfo();
            loadMyPosts();
            loadMyFavs();
        }, [])
    );

    return  <View style={{ flex:1, paddingTop: insets.top }}>
                <View style={{ flex:1 }}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}

                    >
                        <View style={styles.userInfo}>
                            <Image
                                source={
                                    profileImage
                                        ? { uri: profileImage }
                                        : require("../assets/default_profile.jpg")
                                }
                                style={styles.avatar}
                            />

                            <View style={styles.infoColumn}>
                                <Text style={styles.username}>
                                    {user?.name || "User"}
                                </Text>

                                <View style={styles.infoBox}>
                                    <TouchableOpacity style={styles.infoItem}>
                                        <Text style={styles.infoNumbers}>
                                            {myPosts?.length || 0}
                                        </Text>
                                        <Text style={styles.infoText}>posts</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.infoItem}>
                                        <Text style={styles.infoNumbers}>
                                            {user?.followers || 0}
                                        </Text>
                                        <Text style={styles.infoText}>seguidores</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.infoItem}>
                                        <Text style={styles.infoNumbers}>
                                            {user?.followings || 0}
                                        </Text>
                                        <Text style={styles.infoText}>seguindo</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View style={styles.detailsBox}>
                            <View style={styles.detailRow}>
                                <Phone size={16} color="#7D92D4" fill="#7D92D4"/>
                                <Text style={styles.detailText}>
                                    {user?.phoneNumber || "+55 (81) 99999-9999"}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Mail size={16} color="#7D92D4"/>
                                <Text style={styles.detailText}>
                                    {user?.email || "email@email.com"}
                                </Text>
                            </View>

                            <Text style={styles.bioText}>
                                {user?.bio || "Corretor de imóveis trabalhando no ramo a mais de 25 anos"}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.editProfileButton}>
                            <Text style={styles.editProfileText}>
                                Editar perfil
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.postsContainer}>
                            {myPosts.length > 0 && (
                                <>
                                    <Text style={styles.postsTypeText}>meus posts</Text>
                                    <MiniPostCardSlider posts={myPosts} />
                                </>
                            )}
                        </View>
                        <View style={styles.postsContainer}>
                            {myFavs.length > 0 && (
                                <>
                                    <Text style={styles.postsTypeText}>meus favoritos</Text>
                                    <MiniPostCardSlider posts={myFavs} />
                                </>
                            )}
                        </View>
                    </ScrollView>
                </View>
                <Tabbar
                        activeTab={"profile"}
                        onAddPress={() => navigation.navigate("CreateNewPost")}
                        onTabPress={(tab) => {
                            switch (tab) {
                                case 'home':
                                    navigation.replace('Feed');
                                    break;

                                /*case 'search':
                                    navigation.navigate('SearchScreen');
                                    break;

                                case 'chat':
                                    navigation.navigate('ChatScreen');
                                    break;

                                 */
                                case 'profile':
                                    return
                            }
                        }}
                />
            </View>
}

const styles = StyleSheet.create({
    userInfo: {
        flexDirection: "row",
        alignItems: "flex-start",
        padding: 23,
    },
    avatar: {
        height: 100,
        width: 100,
        borderRadius: 70,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    infoColumn: {
        flex: 1,
        marginLeft: 24,
        alignItems: "flex-start",
    },
    username: {
        fontFamily: "Inter-Bold",
        fontSize: 20,
        fontWeight: "700",
        color: "#7D92D4",
        marginBottom: 5,
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 30,
    },
    infoItem: {
        alignItems: "center",
    },
    infoNumbers: {
        color: "#7D92D4",
        fontFamily: "Inter-Bold",
        fontSize: 25,
        fontWeight: "700",
    },
    infoText: {
        color: "#7D92D4",
        fontFamily: "Inter-SemiBold",
        fontSize: 12,
        fontWeight: "600",
    },
    detailsBox: {
        paddingHorizontal: 27,
        paddingBottom: 12,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    detailText: {
        fontFamily: "Inter-SemiBold",
        fontSize: 15,
        fontWeight: 200,
        color: "#7D92D4",
    },
    bioText: {
        fontFamily: "Inter-SemiBold",
        fontSize: 15,
        fontWeight: 200,
        color: "#7D92D4",
        marginTop: 4,
    },
    editProfileButton: {
        width: "auto",
        height: 28,

        marginHorizontal: 21,

        borderRadius: 7,

        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "#333D52",
    },
    editProfileText: {
        color: "#E9E9E9",
        fontWeight: "400",
    },
    postsContainer: {
        marginTop: 15,
    },
    postsTypeText: {
        marginLeft: 28,
        marginBottom: 12,
        fontFamily: "Inter-SemiBold",
        fontSize: 15,
        fontWeight: 200,
        color: "#7D92D4",
    },
});