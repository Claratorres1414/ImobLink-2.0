import {View, Text, StyleSheet, TouchableOpacity} from "react-native";
import {useAuthStore} from "../store/authStore";

export default function FeedScreen() {
    const signOut = useAuthStore((state) => state.signOut);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={signOut}>
                <Text style={styles.buttonText}>Sair</Text>
            </TouchableOpacity>

            <Text>Feed vai ser aqui 👍</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    button: {
        backgroundColor: '#2E86DE',
        padding: 6,
        borderRadius: 2,
        marginTop: 2,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'left',
        fontWeight: '600',
    },
});