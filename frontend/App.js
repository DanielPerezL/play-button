import React, { useState, useEffect } from "react";
import { fetchSongsData, isLoggedIn, logout } from "./services/apiService";
import { cleanCache, shuffleArray } from "./services/utils";
import { StatusBar } from "expo-status-bar";
import TrackPlayer from "react-native-track-player";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AuthWrapper from "./components/AuthWrapper";
import PublicPlaylistsScreen from "./screens/PublicPlaylistsScreen";
import SugereceniasScreen from "./screens/SugerenciasScreen";
import authEventEmitter from "./events/authEvent";
import PlayerScreen from "./screens/PlayerScreen";
import CustomDrawerContent from "./components/CustomDrawerContent";
import UserPlaylistsStack from "./navigation/UserPlaylistStack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HeaderMenuButton from "./components/HeaderMenuButton";

const App = () => {
    const [songs, setSongs] = useState([]);
    const [logged, setLogged] = useState(isLoggedIn());

    const handleLogout = async () => {
        await TrackPlayer.stop();
        await cleanCache();
        await logout();
        setLogged(false);
    };

    const Drawer = createDrawerNavigator();

    useEffect(() => {
        const handleAuthChange = (status) => {
            setLogged(status);
        };

        // Suscribirse al evento
        const subscription = authEventEmitter.addListener(
            "authStatusChanged",
            handleAuthChange
        );

        return () => {
            subscription.remove();
        };
    }, []);

    const handleSongsEnd = async () => {
        const songsData = await fetchSongsData();
        setSongs(shuffleArray(songsData));
    };

    useEffect(() => {
        if (logged) handleSongsEnd();
        if (!logged) handleLogout();
    }, [logged]);

    return (
        <AuthWrapper logged={logged} onLoginSuccess={() => setLogged(true)}>
            <StatusBar style="light" backgroundColor="#222" />
            <SafeAreaProvider>
                <NavigationContainer>
                    <Drawer.Navigator
                        drawerContent={(drawerProps) => (
                            <CustomDrawerContent
                                {...drawerProps}
                                onLogout={handleLogout}
                            />
                        )}
                        screenOptions={{
                            headerLeft: () => (
                                <HeaderMenuButton
                                    style={{ marginLeft: 15, marginRight: 7 }}
                                />
                            ),
                            headerStyle: {
                                backgroundColor: "#333",
                            },
                            headerTintColor: "#fff",
                            drawerStyle: {
                                backgroundColor: "#222", // fondo del drawer
                            },
                            drawerLabelStyle: {
                                color: "#fff", // color de las letras
                                fontWeight: "bold", // estilo opcional
                            },
                        }}
                    >
                        <Drawer.Screen name="Reproductor">
                            {() => (
                                <PlayerScreen
                                    songs={songs}
                                    onSongsEnd={handleSongsEnd}
                                />
                            )}
                        </Drawer.Screen>
                        <Drawer.Screen
                            name="Mis playlists"
                            component={UserPlaylistsStack}
                            options={{ headerShown: false }}
                        />
                        <Drawer.Screen
                            name="Playlist públicas"
                            component={PublicPlaylistsScreen}
                        />
                        <Drawer.Screen
                            name="Sugerir canciones"
                            component={SugereceniasScreen}
                        />
                    </Drawer.Navigator>
                </NavigationContainer>
            </SafeAreaProvider>
        </AuthWrapper>
    );
};

export default App;
