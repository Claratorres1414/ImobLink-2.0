import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import {useAuthStore} from "../store/authStore";
import {ActivityIndicator, View} from "react-native";

export default function Routes() {
    const token = useAuthStore((state) => state.token);
    const loading = useAuthStore((state) => state.loading)

    if (loading) {
        return (
            <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
                <ActivityIndicator />
            </View>
        )
    }

    return (
        <NavigationContainer>
            {token ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
}