import {View, Text, StyleSheet, TouchableOpacity} from "react-native";

type Props = {
    onGetOut: () => void;
};

export default function FeedScreen({ onGetOut }: Props) {
    async function getOut() {
        onGetOut();
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={getOut}>
                <Text style={styles.buttonText}>voltar</Text>
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