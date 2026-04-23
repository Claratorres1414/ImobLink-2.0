import { useAuthStore } from "../store/authStore";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

export default function LogoutButton() {
    const signOut = useAuthStore((state) => state.signOut);

    return (
        <TouchableOpacity onPress={signOut} style={styles.button}>
            <Text style={styles.text}>Sair</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        marginRight: 16,
        paddingHorizontal: 6,
        paddingVertical: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#E74C3C',
        fontWeight: '600',
    },
});