// src/navigation/index.tsx
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';

export default function Routes() {
    return (
        <NavigationContainer>
            <HomeScreen />
        </NavigationContainer>
    );
}