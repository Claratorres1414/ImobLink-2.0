import {RouteProp, useNavigation} from "@react-navigation/native";
import {RootStackParamList} from "../navigation/types";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import Tabbar from "../components/Tabbar";
import React from "react";
import {View} from "react-native";

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

    return (
        <View style={{ flex:1, paddingTop: insets.top }}>
            <View style={{ flex: 1 }}></View>
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