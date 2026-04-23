import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { useAuthStore } from "../store/authStore";
import FeedScreen from "../screens/FeedScreen";
import LoginScreen from "../screens/LoginScreen";
import {useState} from "react";

export default function Routes() {
    const [isLogged, setIsLogged] = useState(false)

    return (
        <NavigationContainer>
            {isLogged ? (
                <AppStack/>
            ) : (
                <AuthStack onLogin={() => setIsLogged(true)} />
            )}
        </NavigationContainer>
    );
}