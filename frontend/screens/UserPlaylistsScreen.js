import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import PlaylistGrid from "../components/PlaylistGrid";
import { fetchUserPlaylists, getLoggedUserId } from "../services/apiService";
import { Ionicons } from "@expo/vector-icons";
import {
    subscribeToPlaylistCreatedEvent,
    unsubscribeFromPlaylistCreatedEvent,
} from "../events/playlistCreatedEvent"; // Importa las funciones

const UserPlaylistsScreen = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigation();

    const getPlaylists = async () => {
        setLoading(true);
        try {
            const userId = await getLoggedUserId();
            const playlistsData = await fetchUserPlaylists(userId);
            console.log("Playlists Data:", playlistsData);

            if (playlistsData.length === 0) {
                setError("No playlists found");
            } else {
                setError(null);
            }

            setPlaylists(playlistsData);
        } catch (err) {
            console.error("Error fetching playlists:", err);
            setError("Error fetching playlists");
        } finally {
            setLoading(false);
        }
    };

    // Escuchar el evento de la creación de playlist
    useEffect(() => {
        getPlaylists(); // Obtener playlists inicialmente

        const listener = subscribeToPlaylistCreatedEvent(() => {
            getPlaylists(); // Actualizar las playlists cuando se crea una nueva
        });

        // Limpiar el listener cuando el componente se desmonte
        return () => {
            unsubscribeFromPlaylistCreatedEvent(listener);
        };
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mis Playlists</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#007bff" />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <PlaylistGrid playlists={playlists} showUser={false} />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate("NewPlaylistScreen")}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#222",
    },
    title: {
        fontSize: 24,
        color: "white",
        marginBottom: 20,
        textAlign: "center",
        fontWeight: "bold",
    },
    errorText: {
        color: "red",
        fontSize: 16,
        textAlign: "center",
    },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 30,
        backgroundColor: "#007bff",
        borderRadius: 30,
        padding: 15,
        elevation: 5,
    },
});

export default UserPlaylistsScreen;
