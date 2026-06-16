import {RouteProp, useFocusEffect, useNavigation} from "@react-navigation/native";
import {RootStackParamList} from "../navigation/types";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ArrowLeft} from "lucide-react-native";
import React, {useCallback, useState} from "react";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import UserInfoPageHeader from "../components/UserInfoPageHeader";
import {useAuthStore} from "../store/authStore";
import EditProfileButton from "../components/EditProfileButton";
import FollowButton from "../components/FollowButton";
import ChatButton from "../components/ChatButton";
import FollowAndChatBar from "../components/FollowAndChatBar";
import MyProfileSlidersGroup from "../components/MyProfileSlidersGroup";
import {getMyFavs, getMyPosts} from "../apiServices/postService";
import {mapPostFromApi} from "../mappers/postMapper";

type Props = {
    route: RouteProp<
        RootStackParamList,
        "UserProfile"
    >;
};

type NavigationProps =
    NativeStackNavigationProp<
        RootStackParamList,
        "UserProfile"
    >;

export default function UserProfileScreen({route}: Props) {
    const navigation =
        useNavigation<NavigationProps>();

    const insets = useSafeAreaInsets();

    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [userFavs, setUserFavs] = useState<any[]>([]);

    const {user, imageProfile} = route.params;
    const currentUserId =
        useAuthStore((state) => state.userId);

    if (user.id === currentUserId) {
        async function loadMyPosts() {
            try {
                const data = await getMyPosts();
                const mapped = Array.isArray(data.data)
                    ? data.data.map(mapPostFromApi)
                    : [];

                setUserPosts(mapped)
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

                setUserFavs(mapped)
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
    }

    return (
        <ScrollView style={{ flex:1, paddingTop: insets.top }}>
            <TouchableOpacity
                style={styles.backButton}
                activeOpacity={0.7}
                onPress={() => {
                    setTimeout(() => {
                        navigation.goBack()
                    }, 100);
                }}
            >
                <ArrowLeft size={30} color="#A3C3FF"/>
            </TouchableOpacity>
            <UserInfoPageHeader user={user} profileImage={imageProfile} postsNum={0}/>
            {
                user &&
                user.id === currentUserId && (
                    <View>
                        <EditProfileButton/>
                        <MyProfileSlidersGroup myFavs={userFavs} myPosts={userPosts} />
                    </View>
                ) || (
                    <View style={{alignItems: "center"}}>
                        <FollowAndChatBar userId={user.id}/>
                    </View>
                )
            }
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    backButton: {
        marginLeft: 24,
        width: 44,
        height: 44,
        justifyContent: "center",
    },
})