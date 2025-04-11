import React, { useState, useEffect, use } from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { fetchSongsData, isLoggedIn, logout } from "./services/apiService";
import Player from "./components/Player";
import { cleanCache, shuffleArray } from "./services/utils";
import { StatusBar } from "expo-status-bar";
import AuthWrapper from "./components/AuthWrapper";
import TrackPlayer from "react-native-track-player";
import authEventEmitter from "./events/authEventEmitter";

const App = () => {
    const [songs, setSongs] = useState([]);
    const [logged, setLogged] = useState(isLoggedIn());

    const handleLogout = async () => {
        await TrackPlayer.stop();
        await cleanCache();
        await logout();
        setLogged(false);
    };

    useEffect(() => {
        const handleAuthChange = (status) => {
            setLogged(status);
        };

        // Suscribirse al evento
        const unsubscribe = authEventEmitter.addListener(
            "authStatusChanged",
            handleAuthChange
        );

        return () => {
            // Limpiar el listener cuando el componente se desmonte
            unsubscribe();
        };
    }, []);

    const handleSongsEnd = async () => {
        const songsData = await fetchSongsData();
        setSongs(shuffleArray(songsData));
    };

    useEffect(() => {
        if (!logged) handleLogout();
    }, [logged]);

    return (
        <AuthWrapper logged={logged} onLoginSuccess={() => setLogged(true)}>
            <View style={{ flex: 1, backgroundColor: "#222" }}>
                <StatusBar style="light" backgroundColor="#222" />
                <Player songs={songs} onSongsEnd={handleSongsEnd} />
                <TouchableOpacity
                    style={{
                        position: "absolute",
                        top: 50,
                        right: 20,
                        backgroundColor: "#ff4d4d",
                        padding: 10,
                        borderRadius: 6,
                    }}
                    onPress={handleLogout}
                >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        Logout
                    </Text>
                </TouchableOpacity>
            </View>
        </AuthWrapper>
    );
};

export default App;
