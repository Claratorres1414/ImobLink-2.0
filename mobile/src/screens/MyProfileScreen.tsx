import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "../navigation/types";

import Tabbar from "../components/Tabbar";
import {useNavigation} from "@react-navigation/native";
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import React, {useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import { Phone, Mail } from 'lucide-react-native';

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
                    <View style={styles.detailsBox}>
                        <View style={styles.detailRow}>
                            <Phone size={16} color="#7D92D4" fill="#7D92D4"/>
                            <Text style={styles.detailText}>
                                {postUser?.phoneNumber || "+55 (81) 99999-9999"}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Mail size={16} color="#7D92D4"/>
                            <Text style={styles.detailText}>
                                {postUser?.email || "email@email.com"}
                            </Text>
                        </View>

                        <Text style={styles.bioText}>
                            {postUser?.bio || "Corretor de imóveis trabalhando no ramo a mais de 25 anos"}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.editProfileButton}>
                        <Text style={styles.editProfileText}>
                            Editar perfil
                        </Text>
                    </TouchableOpacity>
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
        marginLeft: 24,
        alignItems: "flex-start",
    },
    username: {
        fontFamily: "Inter-Bold",
        fontSize: 20,
        fontWeight: "700",
        color: "#7D92D4",
        marginBottom: 5,
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
    detailsBox: {
        marginTop: -25,
        padding: 27,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    detailText: {
        fontFamily: "Inter-SemiBold",
        fontSize: 15,
        fontWeight: 200,
        color: "#7D92D4",
    },
    bioText: {
        fontFamily: "Inter-SemiBold",
        fontSize: 15,
        fontWeight: 200,
        color: "#7D92D4",
        marginTop: 4,
    },
    editProfileButton: {
        width: "auto",
        height: 28,

        marginTop: -8,
        marginHorizontal: 21,

        borderRadius: 7,

        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "#333D52",
    },
    editProfileText: {
        color: "#E9E9E9",
        fontWeight: "400",
    },
});