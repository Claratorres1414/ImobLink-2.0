import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";

import FeedScreen from "../screens/FeedScreen";
import PostDetailScreen from "../screens/PostDetailScreen";

import LogoutButton from "../components/LogoutButton";
import CreateNewPostScreen from "../screens/CreateNewPostScreen";
import MyProfileScreen from "../screens/MyProfileScreen";
import UserProfileScreen from "../screens/UserProfileScreen";
import SearchScreen from "../screens/SearchScreen";
import FollowersScreen from "../screens/FollowersScreen";
import FollowingsScreen from "../screens/FollowingsScreen";


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
                    animation: "simple_push",
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
                    headerShown: false,

                    animation: "simple_push",

                    contentStyle: {
                        backgroundColor: "#fff",
                    },
                }}
            />

            <Stack.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    headerShown: false,

                    animation: "simple_push",

                    contentStyle: {
                        backgroundColor: "#fff",
                    },
                }}
            />

            <Stack.Screen
                name="CreateNewPost"
                component={CreateNewPostScreen}

                options={{
                    headerShown: false,
                    animation: "simple_push",
                    contentStyle: {
                        backgroundColor: "#fff",
                    },
                }}
            />

            <Stack.Screen
                name="MyProfile"
                component={MyProfileScreen}

                options={{
                    headerShown: false,
                    animation: "simple_push",
                    contentStyle: {
                        backgroundColor: "#fff",
                    },
                }}
            />

            <Stack.Screen
                name="UserProfile"
                component={UserProfileScreen}

                options={{
                    headerShown: false,
                    animation: "simple_push",
                    contentStyle: {
                        backgroundColor: "#fff",
                    },
                }}
            />

            <Stack.Screen
                name="Followers"
                component={FollowersScreen}

                options={{
                    headerShown: false,
                    animation: "simple_push",
                    contentStyle: {
                        backgroundColor: "#fff",
                    },
                }}
            />

            <Stack.Screen
                name="Followings"
                component={FollowingsScreen}

                options={{
                    headerShown: false,
                    animation: "simple_push",
                    contentStyle: {
                        backgroundColor: "#fff",
                    },
                }}
            />

        </Stack.Navigator>
    );
}