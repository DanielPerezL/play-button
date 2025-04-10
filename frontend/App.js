import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text, View } from "react-native";
import {
    fetchSongsData,
    isLoggedIn,
    login,
    logout,
} from "./services/apiService";
import Player from "./components/Player";
import { cleanCache, shuffleArray } from "./services/utils";
import { StatusBar } from "expo-status-bar";
import AuthWrapper from "./components/AuthWrapper";
import TrackPlayer from "react-native-track-player";

const App = () => {
    const [songs, setSongs] = useState([]);
    const [logged, setLogged] = useState(false);

    const handleSongsEnd = async () => {
        if (!logged) return;
        const songsData = await fetchSongsData();
        setSongs(shuffleArray(songsData));
    };

    useEffect(() => {
        if (logged) handleSongsEnd();
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
                    onPress={async () => {
                        await TrackPlayer.stop();
                        await cleanCache();
                        await logout();
                        setLogged(false);
                    }}
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
