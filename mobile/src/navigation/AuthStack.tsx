import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from "../screens/LoginScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack({ onLogin }: any) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} onLogin={onLogin} />}
            </Stack.Screen>
        </Stack.Navigator>
    );
}