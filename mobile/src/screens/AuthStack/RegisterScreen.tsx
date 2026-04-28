import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {AuthStackParamList} from "../../navigation/types";

type NavigationProps = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
    const navigation = useNavigation<NavigationProps>();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tela de Cadastro</Text>

            <Text style={styles.subtitle}>
                Aqui vai o formulário depois
            </Text>

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.link}>
                    Já tem conta? Voltar para login
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 12,
    },
    subtitle: {
        color: "#666",
        marginBottom: 20,
    },
    link: {
        color: "#007AFF",
        fontWeight: "bold",
    },
});