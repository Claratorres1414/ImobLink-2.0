import {Image, StyleSheet, View, Text} from "react-native";
import React, {useCallback, useState} from "react";
import FollowButton from "./FollowButton";
import {useAuthStore} from "../store/authStore";
import {useFocusEffect} from "@react-navigation/native";

type Props = {
    user: any
}

export default function UserCard({ user }: Props) {
    const currentUserId =
        useAuthStore((state) => state.userId);
    const [instance, setInstance] = useState(0);

    useFocusEffect(
        useCallback(() => {
            setInstance(v => v + 1);
        }, [])
    );

    return (
        <View style={styles.userInfo}>
            <Image
                source={
                    require("../assets/default_profile.jpg")
                }
                style={styles.avatar}
            />
            <Text style={styles.username}>{user.name}</Text>
            {
                user &&
                user.id !== currentUserId && (
                    <FollowButton key={`${user?.id || null}-${instance}`} userId={user?.id || null}/>
                )
            }
        </View>
    )
}

const styles = StyleSheet.create({
    userInfo: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 21,
        marginTop: 25,
    },
    avatar: {
        height: 50,
        width: 50,
        borderRadius: 70,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    username: {
        fontFamily: "Inter-Bold",
        fontSize: 18,
        fontWeight: "700",
        color: "#7D92D4",
    },
})