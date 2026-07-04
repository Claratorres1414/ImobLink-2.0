import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "../navigation/types";
import {FlatList, View, Text} from "react-native";
import UserCard from "./UserCard";
import {useNavigation} from "@react-navigation/native";

type Props = {
    users: any[]
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "UserProfile">;

export default function UsersList({ users } : Props) {
    const navigation = useNavigation<NavigationProp>();

    return (
        <FlatList
            data={users}
            renderItem={({ item }) => (
                <View>
                    <UserCard user={item} onPress={() =>
                        navigation.navigate("UserProfile", { user: item, imageProfile: item.imageUrl ?? null, })
                    }/>
                </View>
            )}
            showsVerticalScrollIndicator={false}
        />
    )
}