import { View, Text, StyleSheet } from "react-native";

export default function FeedScreen() {
    return (
        <View style={styles.container}>
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
});