import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "../navigation/types";

import Tabbar from "../components/Tabbar";
import {useNavigation} from "@react-navigation/native";
import {View} from "react-native";

type MyProfileNavigationProp =
    NativeStackNavigationProp<
        RootStackParamList,
        "MyProfile"
    >;

export default function MyProfileScreen() {
    const navigation = useNavigation<MyProfileNavigationProp>();

    return  <View style={{ flex:1 }}>
                <View style={{ flex:1 }}>

                </View>
                <Tabbar
                        activeTab={"profile"}
                        style={{marginTop: 100}}
                        onAddPress={() => navigation.navigate("CreateNewPost")}
                        onTabPress={(tab) => {
                            switch (tab) {
                                case 'home':
                                    navigation.replace('Feed');
                                    break;

                                /*case 'search':
                                    navigation.navigate('SearchScreen');
                                    break;

                                case 'chat':
                                    navigation.navigate('ChatScreen');
                                    break;

                                 */
                                case 'profile':
                                    return
                            }
                        }}
                />
            </View>
}