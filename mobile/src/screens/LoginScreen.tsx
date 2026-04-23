import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from "react";

type Props = {
    onLogin: () => void;
};

export default function LoginScreen({ onLogin }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleLogin() {
        if (email && password) {
            console.log("Login ok");
            onLogin();
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ImobLink</Text>
            <Text style={styles.subtitle}>Faça login para continuar</Text>

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

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: '#F5F6FA',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 32,
        textAlign: 'center',
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
});