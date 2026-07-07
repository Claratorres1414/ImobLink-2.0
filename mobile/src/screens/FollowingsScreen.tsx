import {RouteProp, useNavigation} from "@react-navigation/native";
import {RootStackParamList} from "../navigation/types";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {ArrowLeft} from "lucide-react-native";
import React, {useEffect, useState} from "react";
import {getFollowings} from "../apiServices/followService";
import UsersList from "../components/UsersList";
import {SearchBar} from "../components/SearchBar";

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
    const [followings, setFollowings] = useState<any>([])
    const [search, setSearch] = useState('');

    const filteredFollowings = followings.filter((user: any) =>
        user.name.toLowerCase().includes(search.toLowerCase())
    );

    const insets = useSafeAreaInsets();

    const navigation =
        useNavigation<NavigationProps>();

    const {user} = route.params;

    async function loadFollowings() {
        try {
            const data = (await getFollowings(user.id)).data;
            setFollowings(data.data);
        } catch (error) {
            console.log('Erro ao carregar followings:', error);
        }
    }

    useEffect(() => {
        loadFollowings();
    }, []);

    return (
        <View style= {{ flex: 1, paddingTop: insets.top, alignItems: "center" }}>
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

            <View>
                <SearchBar
                    value={search}
                    onChangeText={setSearch}
                />
                <UsersList users={filteredFollowings} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    backButton: {
        flexDirection: "row",
        paddingRight: 350,
        marginLeft: 24,
        marginTop: 16,
        width: 44,
        height: 44,
        justifyContent: "center",
    },
});