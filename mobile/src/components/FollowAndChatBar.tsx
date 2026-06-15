import {View, StyleSheet} from "react-native";
import ChatButton from "./ChatButton";
import FollowButton from "./FollowButton";

type Props = {
    userId: number;
}

export default function FollowAndChatBar({ userId }: Props) {
    return (
        <View style={styles.container}>
            <FollowButton userId={userId} width={160}/>
            <ChatButton />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 20,
    }
})