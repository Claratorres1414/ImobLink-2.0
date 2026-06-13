import {RouteProp, useNavigation} from "@react-navigation/native";
import {RootStackParamList} from "../navigation/types";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {StyleSheet, Text, TouchableOpacity} from "react-native";
import {ArrowLeft} from "lucide-react-native";
import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";

type Props = {
    route: RouteProp<
        RootStackParamList,
        "UserProfile"
    >;
};

type NavigationProps =
    NativeStackNavigationProp<
        RootStackParamList,
        "UserProfile"
    >;

export default function UserProfileScreen({route}: Props) {
    const navigation =
        useNavigation<NavigationProps>();

    const {user} = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                activeOpacity={0.7}
                onPress={() => {
                    setTimeout(() => {
                        navigation.goBack()
                    }, 100);
                }}
            >
                <ArrowLeft size={30} color="#A3C3FF"/>
            </TouchableOpacity>
            <Text>
                Aqui será a tela de perfil :)
            </Text>
            <Text> {user.id} | {user.name} | {user?.followers || 0} | {user?.followings || 0}</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    backButton: {
        marginLeft: 24,
        marginTop: 16,
        width: 44,
        height: 44,
        justifyContent: "center",
    },
})