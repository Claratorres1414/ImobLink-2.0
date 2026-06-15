import {RouteProp, useNavigation} from "@react-navigation/native";
import {RootStackParamList} from "../navigation/types";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {ArrowLeft} from "lucide-react-native";
import React from "react";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import UserInfoPageHeader from "../components/UserInfoPageHeader";
import {useAuthStore} from "../store/authStore";
import EditProfileButton from "../components/EditProfileButton";
import FollowButton from "../components/FollowButton";
import ChatButton from "../components/ChatButton";
import FollowAndChatBar from "../components/FollowAndChatBar";

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

    const {user, imageProfile} = route.params;
    const currentUserId =
        useAuthStore((state) => state.userId);

    return (
        <View style={{ flex:1, paddingTop: insets.top }}>
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
                    <EditProfileButton/>
                ) || (
                    <View style={{alignItems: "center"}}>
                        <FollowAndChatBar userId={user.id}/>
                    </View>
                )
            }
        </View>
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