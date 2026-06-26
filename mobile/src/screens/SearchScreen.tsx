import {RouteProp, useNavigation} from "@react-navigation/native";
import {RootStackParamList} from "../navigation/types";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import Tabbar from "../components/Tabbar";
import React, {useState} from "react";
import {View} from "react-native";
import {SearchBar} from "../components/SearchBar";

type Props = {
    route: RouteProp<
        RootStackParamList,
        "Search"
    >;
};

type NavigationProps =
    NativeStackNavigationProp<
        RootStackParamList,
        "Search"
    >;

export default function SearchScreen({route}: Props) {
    const navigation = useNavigation<NavigationProps>();
    const insets = useSafeAreaInsets();

    const [search, setSearch] = useState('');

    return (
        <View style={{ flex:1, paddingTop: insets.top, alignItems: "center" }}>
            <View style={{ flex: 1 }}>
                <SearchBar
                    value={search}
                    onChangeText={setSearch}
                />
            </View>
            <Tabbar
                activeTab={"search"}
                onAddPress={() => navigation.navigate("CreateNewPost")}
                onTabPress={(tab) => {
                    switch (tab) {
                        case 'home':
                            navigation.replace('Feed');
                            break;

                        case 'search':
                            return;

                        /*case 'chat':
                            navigation.navigate('ChatScreen');
                            break;

                         */
                        case 'profile':
                            navigation.replace('MyProfile');
                            break;
                    }
                }}
            />
        </View>
    )
}