import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {RouteProp, useNavigation} from "@react-navigation/native";
import {RootStackParamList} from "../navigation/types";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {ArrowLeft} from "lucide-react-native";
import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";

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
                    <ArrowLeft size={30} color="#A3C3FF"/>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7} onPress={() => {}}>
                    <Text style={styles.publishText}>Publicar</Text>
                </TouchableOpacity>
            </View>
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
        color: '#A3C3FF',
    },
    backButton: {
        width: 44,
        height: 35,
        justifyContent: 'center',
    },
})