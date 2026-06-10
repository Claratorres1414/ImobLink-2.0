import {StyleSheet, Text, TouchableOpacity} from "react-native";

export default function FollowButton() {
    return (
        <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followText}>Seguir</Text>
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