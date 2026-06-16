import {Text, StyleSheet, TouchableOpacity, View, Image} from "react-native";
import React from "react";
import {Mail} from "lucide-react-native/icons";
import {Phone} from "lucide-react-native";

type Props = {
    user: any,
    profileImage: string | null,
    postsNum: number | null
};

export default function UserInfoPageHeader({ user, profileImage, postsNum } : Props) {
    return (
    <View style={{marginTop: -15}}>
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
                    {user?.name || "User"}
                </Text>

                <View style={styles.infoBox}>
                    <TouchableOpacity style={styles.infoItem}>
                        <Text style={styles.infoNumbers}>
                            {postsNum || 0}
                        </Text>
                        <Text style={styles.infoText}>posts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.infoItem}>
                        <Text style={styles.infoNumbers}>
                            {user?.followers || 0}
                        </Text>
                        <Text style={styles.infoText}>seguidores</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.infoItem}>
                        <Text style={styles.infoNumbers}>
                            {user?.followings || 0}
                        </Text>
                        <Text style={styles.infoText}>seguindo</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
        <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
                <Phone size={16} color="#7D92D4" fill="#7D92D4"/>
                <Text style={styles.detailText}>
                    {user?.phoneNumber || "+55 (81) 99999-9999"}
                </Text>
            </View>

            <View style={styles.detailRow}>
                <Mail size={16} color="#7D92D4"/>
                <Text style={styles.detailText}>
                    {user?.email || "email@email.com"}
                </Text>
            </View>

            <Text style={styles.bioText}>
                {user?.bio || "Corretor de imóveis trabalhando no ramo a mais de 25 anos"}
            </Text>
        </View>
    </View>
    )
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
        paddingHorizontal: 27,
        paddingBottom: 12,
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
})