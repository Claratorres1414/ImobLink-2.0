import {StyleSheet, Text, TouchableOpacity} from "react-native";

export default function ChatButton() {
    return (
        <TouchableOpacity
            style={[
                styles.chatButton,
            ]}
            activeOpacity={0.7}
        >
            <Text style={styles.followText}>Contatar</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    chatButton: {
        marginLeft: "auto",

        marginTop: 7,

        width: 160,
        height: 32,

        borderRadius: 7,

        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "#4f2c6e",
    },

    followText: {
        color: "#E9E9E9",
        fontWeight: "600",
    },
});