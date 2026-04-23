import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import {useState} from "react";

export default function Routes() {
    const [isLogged, setIsLogged] = useState(false)

    return (
        <NavigationContainer>
            {isLogged ? (
                <AppStack onGetOut={() => setIsLogged(false)} />
            ) : (
                <AuthStack onLogin={() => setIsLogged(true)} />
            )}
        </NavigationContainer>
    );
}