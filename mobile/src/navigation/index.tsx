import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from "../screens/LoginScreen";

export default function Routes() {
    return (
        <NavigationContainer>
            <LoginScreen />
        </NavigationContainer>
    );
}