import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Props = {
    route: RouteProp<
        RootStackParamList,
        "PostDetails"
    >;
};

type NavigationProps =
    NativeStackNavigationProp<
        RootStackParamList,
        "PostDetails"
    >;

export default function PostDetailScreen({ route }: Props) {
    const navigation =
        useNavigation<NavigationProps>();

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                activeOpacity={0.7}
                onPress={() => {
                    setTimeout(() => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "Feed" }],
                        });
                    }, 100);
                }}
            >
                <ArrowLeft size={30} color="#A3C3FF" />
            </TouchableOpacity>

            <View style={styles.header}>

                <View style={styles.userInfo}>
                    <Image
                        source={require("../assets/default_profile.jpg")}
                        style={styles.avatar}
                    />

                    <Text style={styles.username}>
                        user
                    </Text>
                </View>

                <TouchableOpacity style={styles.followButton}>
                    <Text style={styles.followText}>
                        Seguir
                    </Text>
                </TouchableOpacity>

            </View>
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

    header: {
        marginTop: 10,
        marginHorizontal: 24,

        height: 74,

        flexDirection: "row",
        alignItems: "flex-start",
    },

    userInfo: {
        flexDirection: "row",
        alignItems: "center",
    },

    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,

        elevation: 4,
    },

    username: {
        marginLeft: 12,
        marginTop: -12,

        fontSize: 18,
        fontWeight: "600",
        color: "#7D92D4",
    },

    followButton: {
        marginLeft: "auto",

        marginTop: 7,

        width: 70,
        height: 32,

        borderRadius: 7,

        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "#FF8C42",
    },

    followText: {
        color: "#E9E9E9",
        fontWeight: "600",
    }
});