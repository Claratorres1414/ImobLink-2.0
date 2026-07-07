import {RouteProp, useNavigation} from "@react-navigation/native";
import {RootStackParamList} from "../navigation/types";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {ArrowLeft} from "lucide-react-native";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import React, {useEffect, useState} from "react";
import {getFollowers} from "../apiServices/followService";
import UsersList from "../components/UsersList";
import {SearchBar} from "../components/SearchBar";

type Props = {
    route: RouteProp<
        RootStackParamList,
        "Followers"
    >;
};

type NavigationProps =
    NativeStackNavigationProp<
        RootStackParamList,
        "Followers"
    >;

export default function FollowersScreen({route}: Props) {
    const [followers, setFollowers] = useState<any>([])
    const [search, setSearch] = useState('');

    const filteredFollowers = followers.filter((user: any) =>
        user.name.toLowerCase().includes(search.toLowerCase())
    );

    const insets = useSafeAreaInsets();

    const navigation =
        useNavigation<NavigationProps>();

    const {user} = route.params;

    async function loadFollowers() {
        try {
            const data = (await getFollowers(user.id)).data;
            setFollowers(data.data);
        } catch (error) {
            console.log('Erro ao carregar followers:', error);
        }
    }

    useEffect(() => {
        loadFollowers();
    }, []);

    return (
        <View style={{ flex: 1, paddingTop: insets.top, alignItems: "center" }}>
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
                <UsersList users={filteredFollowers} />
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