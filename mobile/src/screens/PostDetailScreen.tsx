import { View, TouchableOpacity, StyleSheet } from "react-native";
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
});