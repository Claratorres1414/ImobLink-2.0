import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FeedScreen from '../screens/FeedScreen'
import LogoutButton from "../components/LogoutButton";

const Stack = createNativeStackNavigator();

export default function AppStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Feed"
                component={FeedScreen}
                options={{
                    headerShown: true,
                    headerStyle: { backgroundColor: '#fff' },
                    title: 'ImobLink',
                    headerRight: () => <LogoutButton />,
                }}
            />
        </Stack.Navigator>
    );
}