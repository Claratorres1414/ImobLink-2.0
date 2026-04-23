import { StatusBar } from 'expo-status-bar';
import Routes from './src/navigation';
import {useAuthStore} from "./src/store/authStore";
import {useEffect} from "react";

export default function App() {
    const loadToken = useAuthStore((state) => state.loadToken);

    useEffect(() => {
        loadToken();
    }, []);

  return (
      <>
        <Routes />
        <StatusBar style="auto" />
      </>
  );
}