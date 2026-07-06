import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "../navigation/types";

import Tabbar from "../components/Tabbar";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {ScrollView, StyleSheet, Text, View} from "react-native";
import React, {useCallback, useState} from "react";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {getUserInfo} from "../apiServices/userService";
import UserInfoPageHeader from "../components/UserInfoPageHeader";
import {getProfileImage} from "../apiServices/imageService";
import EditProfileButton from "../components/EditProfileButton";
import {getMyFavs, getMyPosts} from "../apiServices/postService";
import {mapPostFromApi} from "../mappers/postMapper";
import MyProfileSlidersGroup from "../components/MyProfileSlidersGroup";

type MyProfileNavigationProp =
    NativeStackNavigationProp<
        RootStackParamList,
        "MyProfile"
    >;

export default function MyProfileScreen() {
    const navigation = useNavigation<MyProfileNavigationProp>();
    const insets = useSafeAreaInsets();

    const [user, setUser] = useState<any>(null);
    const [profileImage, setProfileImage] =
        useState<string | null>(null);
    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [myFavs, setMyFavs] = useState<any[]>([]);

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

    useFocusEffect(
        useCallback(() => {
            loadUserInfo();
        }, [])
    );

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
                        <UserInfoPageHeader
                            user={user}
                            profileImage={profileImage}
                            postsNum={myPosts.length}
                            onFollowingsPress={() =>
                                navigation.navigate(
                                "Followings", {
                                    user: user
                                }
                            )}
                            onFollowersPress={() =>
                                navigation.navigate(
                                "Followers", {
                                    user: user,
                                }
                            )}
                        />
                        <EditProfileButton />
                        <MyProfileSlidersGroup myFavs={myFavs} myPosts={myPosts} />
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

                                case 'search':
                                    navigation.replace('Search');
                                    break;

                                /*case 'chat':
                                    navigation.replace('ChatScreen');
                                    break;

                                 */
                                case 'profile':
                                    return;
                            }
                        }}
                />
            </View>
}