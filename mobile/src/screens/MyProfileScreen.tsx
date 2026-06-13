import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "../navigation/types";

import Tabbar from "../components/Tabbar";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import React, {useCallback, useState} from "react";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {getUserInfo} from "../apiServices/userService";
import {getMyFavs, getMyPosts} from "../apiServices/postService";
import {mapPostFromApi} from "../mappers/postMapper";
import MiniPostCardSlider from "../components/MiniPostCardSlider";
import UserInfoPageHeader from "../components/UserInfoPageHeader";
import {getProfileImage} from "../apiServices/imageService";

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

            const imageUri = await getProfileImage(
                data.data.imageProfileId
            );

            setProfileImage(imageUri);
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
                        <UserInfoPageHeader user={user} profileImage={profileImage} postsNum={myPosts.length}/>
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