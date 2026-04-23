import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FeedScreen from '../screens/FeedScreen'

const Stack = createNativeStackNavigator();

export default function AppStack({ onGetOut }: any) {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Feed">
                {(props) => <FeedScreen {...props} onGetOut={onGetOut} />}
            </Stack.Screen>
        </Stack.Navigator>
    )
}