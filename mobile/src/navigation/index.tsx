import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import {useAuthStore} from "../store/authStore";

export default function Routes() {
    const token = useAuthStore((state) => state.token);

    return (
        <NavigationContainer>
            {token ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
}