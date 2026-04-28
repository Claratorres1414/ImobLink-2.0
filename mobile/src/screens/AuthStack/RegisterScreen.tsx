import {View, Text, TouchableOpacity, StyleSheet, TextInput} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {AuthStackParamList} from "../../navigation/types";
import {useState} from "react";

type NavigationProps = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
    const navigation = useNavigation<NavigationProps>();

    const [cpf, setCpf] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConf, setPasswordConf] = useState('');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cadastre-se</Text>

            <TextInput
                placeholder="cpf: 000.000.000-00"
                style={styles.input}
                value={cpf}
                onChangeText={setCpf}
                autoCapitalize={"none"}
            />

            <TextInput
                placeholder="telefone: (00) 90000-0000"
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                autoCapitalize={"none"}
            />

            <TextInput
                placeholder="e-mail"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize={"none"}
            />

            <TextInput
                placeholder="senha"
                style={styles.input}
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
            />

            <TextInput
                placeholder="confirme sua senha"
                style={styles.input}
                secureTextEntry={true}
                value={passwordConf}
                onChangeText={setPasswordConf}
            />

            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Cadastrar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.goBack()}>
                <Text style={styles.link}>
                    Já tem conta? Voltar para login
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
        justifyContent: "center",
        backgroundColor: '#F5F6FA',
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 12,
        textAlign: "center",
    },
    subtitle: {
        color: "#666",
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    button: {
        backgroundColor: '#2E86DE',
        padding: 14,
        borderRadius: 8,
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
    },
    linkContainer: {
        marginTop: 20,
        alignItems: "center",
    },
    link: {
        color: "#007AFF",
        fontWeight: "bold",
    },
});