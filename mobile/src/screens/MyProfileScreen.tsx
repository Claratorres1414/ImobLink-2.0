import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "../navigation/types";

import Tabbar from "../components/Tabbar";
import {useNavigation} from "@react-navigation/native";
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import React, {useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";

type MyProfileNavigationProp =
    NativeStackNavigationProp<
        RootStackParamList,
        "MyProfile"
    >;

export default function MyProfileScreen() {
    const navigation = useNavigation<MyProfileNavigationProp>();

    const [images, setImages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [postDetails, setPostDetails] = useState<any>(null);
    const [postUser, setPostUser] = useState<any>(null);
    const [profileImage, setProfileImage] =
        useState<string | null>(null);

    return  <View style={{ flex:1 }}>
                <SafeAreaView style={{ flex:1 }}>
                    <View style={styles.userInfo}>
                        <Image
                            source={
                                profileImage
                                    ? { uri: profileImage }
                                    : require("../assets/default_profile.jpg")
                            }
                            style={styles.avatar}
                        />

                        <View style={styles.infoColumn}>
                            <Text style={styles.username}>
                                {postUser?.name || "User"}
                            </Text>

                            <View style={styles.infoBox}>
                                <TouchableOpacity style={styles.infoItem}>
                                    <Text style={styles.infoNumbers}>10</Text>
                                    <Text style={styles.infoText}>posts</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.infoItem}>
                                    <Text style={styles.infoNumbers}>10</Text>
                                    <Text style={styles.infoText}>seguidores</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.infoItem}>
                                    <Text style={styles.infoNumbers}>10</Text>
                                    <Text style={styles.infoText}>seguindo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    header: {
        marginTop: 10,
        marginHorizontal: 24,

        height: 74,

        flexDirection: "row",
        alignItems: "flex-start",
    },

    userInfo: {
        flexDirection: "row",
        alignItems: "flex-start",
        padding: 23,
    },
    avatar: {
        height: 100,
        width: 100,
        borderRadius: 70,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    infoColumn: {
        flex: 1,
        marginLeft: 24,       // distância entre avatar e coluna de info
        alignItems: "flex-start",
    },
    username: {
        fontFamily: "Inter-Bold",
        fontSize: 20,
        fontWeight: "700",
        color: "#7D92D4",
        marginBottom: 5,      // distância entre nome e campos de info
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 30,
    },
    infoItem: {
        alignItems: "center",
    },
    infoNumbers: {
        color: "#7D92D4",
        fontFamily: "Inter-Bold",
        fontSize: 25,
        fontWeight: "700",
    },
    infoText: {
        color: "#7D92D4",
        fontFamily: "Inter-SemiBold",
        fontSize: 12,
        fontWeight: "600",
    },
});