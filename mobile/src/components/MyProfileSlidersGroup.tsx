import {StyleSheet, Text, View} from "react-native";
import MiniPostCardSlider from "./MiniPostCardSlider";

type Props = {
    myPosts?: any[]
    myFavs?: any[]
}

export default function MyProfileSlidersGroup ({myPosts = [], myFavs = []}: Props) {
    return (
        <View>
            <View style={styles.postsContainer}>
                {myPosts.length > 0 && (
                    <>
                        <Text style={styles.postsTypeText}>meus posts</Text>
                        <MiniPostCardSlider posts={myPosts} />
                    </>
                )}
            </View>
            <View style={styles.postsContainer}>
                {myFavs.length > 0 && (
                    <>
                        <Text style={styles.postsTypeText}>meus favoritos</Text>
                        <MiniPostCardSlider posts={myFavs} />
                    </>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    postsContainer: {
        marginTop: 15,
    },
    postsTypeText: {
        marginLeft: 28,
        marginBottom: 12,
        fontFamily: "Inter-SemiBold",
        fontSize: 15,
        fontWeight: 200,
        color: "#7D92D4",
    },
});