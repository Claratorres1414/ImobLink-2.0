import {StyleSheet, Text, TouchableOpacity} from "react-native";
import {useEffect, useState} from "react";
import {checkFollow} from "../apiServices/followService";

type Props = {
    userId: number;
}

export default function FollowButton({ userId }: Props) {
    const [following, setFollowing] = useState(false);

    async function checkFollowing() {
        const response = await checkFollow(userId)
        setFollowing(response.data)
    }

    useEffect(() => {
        checkFollowing()
    }, []);

    const buttonText = following ? "Seguindo" : "Seguir";

    return (
        <TouchableOpacity style={styles.followButton}>
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

    followText: {
        color: "#E9E9E9",
        fontWeight: "600",
    },
})