import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RootStackParamList} from "../navigation/types";
import {FlatList, View, Text} from "react-native";
import UserCard from "./UserCard";

type Props = {
    users: any[]
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "UserProfile">;

export default function UsersList({ users } : Props) {
    return (
        <FlatList
            data={users}
            renderItem={({ item }) => (
                <View>
                    <UserCard user={item}/>
                </View>
            )}
            showsVerticalScrollIndicator={false}
        />
    )
}