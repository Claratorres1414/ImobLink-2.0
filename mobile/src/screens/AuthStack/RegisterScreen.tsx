import {ScrollView, Text, TouchableOpacity, StyleSheet, TextInput, View, Alert} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {AuthStackParamList} from "../../navigation/types";
import {useMemo, useState} from "react";
import {isValidEmail, maskCpf, maskPhone} from "../../utils/registerForm";
import {registerUser} from "../../apiServices/authService";
import {onlyNumbers} from "../../utils/forms";

type NavigationProps = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
    const navigation = useNavigation<NavigationProps>();

    const [cpf, setCpf] = useState('');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConf, setPasswordConf] = useState('');

    const cpfError = cpf.length > 0 && cpf.length < 14;
    const phoneError = phone.length > 0 && phone.length < 15;
    const emailError = email.length > 0 && !isValidEmail(email);
    const passwordError = password.length > 0 && password.length < 6;
    const passwordConfError =
        passwordConf.length > 0 && password !== passwordConf;

    const isFormValid = useMemo(() => {
        return (
            cpf.length === 14 &&
            phone.length >= 14 &&
            name != "" &&
            isValidEmail(email) &&
            password.length >= 6 &&
            password === passwordConf
        );
    }, [cpf, phone, email, password, passwordConf]);

    const [loading, setLoading] = useState(false);

    async function handleRegister() {
        if (!isFormValid || loading) return;

        try {
            setLoading(true);

            await registerUser({
                cpf: onlyNumbers(cpf),
                phoneNumber: onlyNumbers(phone),
                name,
                email,
                password,
            });

            Alert.alert("Sucesso", "Conta criada com sucesso!");
            navigation.goBack();
        } catch (error: any) {
            const message =
                error?.response?.data?.message || "Não foi possível criar sua conta";
            Alert.alert("Erro", message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Cadastre-se</Text>
            <Text style={styles.subtitle}>Preencha os dados para começar</Text>

            <View style={styles.field}>
                <TextInput
                    placeholder="Nome completo"
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize={"none"}
                />
            </View>

            <View style={styles.field}>
                <TextInput
                    placeholder="CPF"
                    style={[styles.input, cpfError && styles.inputError]}
                    value={cpf}
                    onChangeText={(text) => setCpf(maskCpf(text))}
                    keyboardType="numeric"
                />
                {cpfError && <Text style={styles.errorText}>CPF inválido</Text> }
            </View>

            <View>
                <TextInput
                    placeholder="Telefone"
                    style={[styles.input, phoneError && styles.inputError]}
                    value={phone}
                    onChangeText={(text) => setPhone(maskPhone(text))}
                    keyboardType="phone-pad"
                />
                {phoneError && <Text style={styles.errorText}>Telefone inválido</Text>}
            </View>

            <View>
                <TextInput
                    placeholder="e-mail"
                    style={[styles.input, emailError && styles.inputError]}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize={"none"}
                    keyboardType="email-address"
                />
                {emailError && <Text style={styles.errorText}>E-mail inválido</Text>}
            </View>

            <View>
                <TextInput
                    placeholder="senha"
                    style={[styles.input, passwordError && styles.inputError]}
                    secureTextEntry={true}
                    value={password}
                    onChangeText={setPassword}
                />
                {passwordError && <Text style={styles.errorText}>A senha deve conter no mínimo 6 caracteres</Text>}
            </View>

            <View>
                <TextInput
                    placeholder="confirme sua senha"
                    style={[styles.input, passwordConfError && styles.inputError]}
                    secureTextEntry={true}
                    value={passwordConf}
                    onChangeText={setPasswordConf}
                />
                {passwordConfError && <Text style={styles.errorText}>As senhas não coincidem</Text>}
            </View>

            <TouchableOpacity
                style={[styles.button, (!isFormValid || loading) && styles.buttonDisabled]}
                disabled={!isFormValid || loading}
                onPress={handleRegister}
            >
                <Text style={styles.buttonText}>
                    {loading ? "Cadastrando..." : "Cadastrar"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.goBack()}>
                <Text style={styles.link}>
                    Já tem conta? Voltar para login
                </Text>
            </TouchableOpacity>
        </ScrollView>
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
        textAlign: "center",
    },
    field: {
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    inputError: {
        borderColor: "#E74C3C",
    },
    errorText: {
        color: "#E74C3C",
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    button: {
        backgroundColor: '#2E86DE',
        padding: 14,
        borderRadius: 8,
        marginTop: 8,
    },
    buttonDisabled: {
        backgroundColor: "#A9C9F5",
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