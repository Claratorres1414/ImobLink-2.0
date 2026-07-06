import {RouteProp, useNavigation} from "@react-navigation/native";
import {RootStackParamList} from "../navigation/types";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {useAuthStore} from "../store/authStore";
import {SafeAreaView} from "react-native-safe-area-context";
import {StyleSheet, TouchableOpacity} from "react-native";
import {ArrowLeft} from "lucide-react-native";
import React from "react";

type Props = {
    route: RouteProp<
        RootStackParamList,
        "Followings"
    >;
};

type NavigationProps =
    NativeStackNavigationProp<
        RootStackParamList,
        "Followings"
    >;

export default function FollowingsScreen({route}: Props) {
    const navigation =
        useNavigation<NavigationProps>();

    const {user} = route.params;
    const currentUserId =
        useAuthStore((state) => state.userId);

    return (
        <SafeAreaView>
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
        </SafeAreaView>
    )
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
});