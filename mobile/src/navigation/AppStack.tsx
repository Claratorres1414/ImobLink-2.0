import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";

import FeedScreen from "../screens/FeedScreen";
import PostDetailScreen from "../screens/PostDetailScreen";

import LogoutButton from "../components/LogoutButton";

const Stack =
    createNativeStackNavigator<RootStackParamList>();

export default function AppStack() {
    return (
        <Stack.Navigator>

            <Stack.Screen
                name="Feed"
                component={FeedScreen}
                options={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: "#fff"
                    },
                    title: "ImobLink",
                    headerRight: () => <LogoutButton />,
                }}
            />

            <Stack.Screen
                name="PostDetails"
                component={PostDetailScreen}
                options={{
                    headerShown: false
                }}
            />

        </Stack.Navigator>
    );
}