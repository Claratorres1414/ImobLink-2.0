import {StyleSheet, Text, TouchableOpacity} from "react-native";
import {useEffect, useState} from "react";
import {checkFollow, followUser, unfollowUser} from "../apiServices/followService";

type Props = {
    userId: number;
    width?: number;
}

export default function FollowButton({ userId, width = 70 }: Props) {
    const [following, setFollowing] = useState(false);

    async function checkFollowing() {
        const response = await checkFollow(userId)
        setFollowing(response.data.data)
    }

    useEffect(() => {
        checkFollowing()
    }, [userId]);

    const buttonText = following ? "Seguindo" : "Seguir";

    async function handleFollow() {
        const previousFollowed = following;

        setFollowing(!previousFollowed);

        try {
            if (previousFollowed) {
                await unfollowUser(userId);
            } else {
                await followUser(userId);
            }
        } catch (error) {
            setFollowing(previousFollowed);
            console.log(error);
        }
    }

    return (
        <TouchableOpacity
            style={[
                styles.followButton,
                following && styles.followingButton,
                {width},
            ]}
            activeOpacity={0.7}
            onPress={handleFollow}
        >
            <Text style={styles.followText}>{buttonText}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
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

    followingButton: {
        width: 75,
        borderRadius: 8,
        backgroundColor: "#FFC107",
    },

    followText: {
        color: "#E9E9E9",
        fontWeight: "600",
    },
});