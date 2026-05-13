import {Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {RouteProp, useNavigation} from "@react-navigation/native";
import {RootStackParamList} from "../navigation/types";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {ArrowLeft} from "lucide-react-native";
import React, {useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import AddImageSlider from '../components/AddImagesSlider';

const { width } = Dimensions.get("window");

type Props = {
    route: RouteProp<
        RootStackParamList,
        "CreateNewPost"
    >;
};

type NavigationProps =
    NativeStackNavigationProp<
        RootStackParamList,
        "CreateNewPost"
    >;

export default function CreateNewPostScreen({route}: Props) {
    const navigation =
        useNavigation<NavigationProps>();

    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [bairro, setBairro] = useState('');
    const [rua, setRua] = useState('');
    const [numero, setNumero] = useState('');
    const [tipo, setTipo] = useState<'venda' | 'aluguel' | null>(null);

    return(
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    activeOpacity={0.7}
                    onPress={() => {
                        setTimeout(() => {
                            navigation.reset({
                                index: 0,
                                routes: [{name: "Feed"}],
                            });
                        }, 100);
                    }}
                >
                    <ArrowLeft size={30} color="#7D92D4"/>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7} onPress={() => {}}>
                    <Text style={styles.publishText}>Publicar</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.imageContainer}>
                <AddImageSlider />
            </View>

            <ScrollView style={styles.scrollContent}>
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Título"
                        placeholderTextColor="#ABABAB"
                        value={titulo}
                        onChangeText={setTitulo}
                    />

                    <TextInput
                        style={[styles.input, styles.inputMultiline]}
                        placeholder="Descrição"
                        placeholderTextColor="#ABABAB"
                        value={descricao}
                        onChangeText={setDescricao}
                        multiline
                        textAlignVertical="top"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Bairro"
                        placeholderTextColor="#ABABAB"
                        value={bairro}
                        onChangeText={setBairro}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Rua"
                        placeholderTextColor="#ABABAB"
                        value={rua}
                        onChangeText={setRua}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Número"
                        placeholderTextColor="#ABABAB"
                        value={numero}
                        onChangeText={setNumero}
                        keyboardType="numeric"
                    />

                    <View style={styles.selectorRow}>
                        <TouchableOpacity
                            style={[
                                styles.selectorOption,
                                tipo === 'venda' && styles.selectorActive,
                            ]}
                            activeOpacity={0.7}
                            onPress={() => setTipo('venda')}
                        >
                            <Text style={[
                                styles.selectorText,
                                tipo === 'venda' && styles.selectorTextActive,
                            ]}>
                                Venda
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.selectorOption,
                                tipo === 'aluguel' && styles.selectorActive,
                            ]}
                            activeOpacity={0.7}
                            onPress={() => setTipo('aluguel')}
                        >
                            <Text style={[
                                styles.selectorText,
                                tipo === 'aluguel' && styles.selectorTextActive,
                            ]}>
                                Aluguel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 345,
        alignSelf: 'center',
        marginTop: 16,
    },
    publishText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 15,
        color: '#7D92D4',
    },
    backButton: {
        width: 44,
        height: 35,
        justifyContent: 'center',
    },
    imageContainer: {
        marginTop: 15,
    },
    scrollContent: {
        marginTop: 15,
        paddingBottom: 40,
    },
    form: {
        alignItems: 'center',
        gap: 20,
        marginTop: 20,
    },
    input: {
        width: 345,
        height: 48,
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: '#333D52',
    },
    inputMultiline: {
        height: 100,
        paddingTop: 14,
    },
    selectorRow: {
        width: 345,
        flexDirection: 'row',
        gap: 12,
    },
    selectorOption: {
        flex: 1,
        height: 48,
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectorActive: {
        backgroundColor: '#333D52',
    },
    selectorText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        color: '#ABABAB',
    },
    selectorTextActive: {
        color: '#FFFFFF',
    },
})