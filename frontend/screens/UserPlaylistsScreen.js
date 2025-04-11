import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import PlaylistGrid from "../components/PlaylistGrid"; // Importa el componente PlaylistGrid
import { fetchUserPlaylists, getLoggedUserId } from "../services/apiService"; // Asegúrate de tener la función fetchUserPlaylists
import { useFocusEffect } from "@react-navigation/native";

const UserPlaylistsScreen = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Para manejar errores
    const [refresh, setRefresh] = useState(0); // Agregar un contador para forzar el re-render

    const getPlaylists = async () => {
        setLoading(true);
        try {
            const userId = await getLoggedUserId(); // Obtén el userId
            const playlistsData = await fetchUserPlaylists(userId); // Llama al servicio para obtener las playlists
            console.log("Playlists Data:", playlistsData); // Verifica que las playlists sean correctas

            if (playlistsData.length === 0) {
                setError("No playlists found"); // Si no hay playlists, mostrar mensaje de error
            }

            setPlaylists(playlistsData); // Almacena las playlists en el estado
            setRefresh((prev) => prev + 1);
        } catch (err) {
            console.error("Error fetching playlists:", err);
            setError("Error fetching playlists");
        } finally {
            setLoading(false); // Cambia el estado de carga
        }
    };

    useEffect(() => {
        getPlaylists();
    }, []);

    useFocusEffect(
        useCallback(() => {
            getPlaylists(); // Llamamos a la función de obtención de playlists
        }, []) // Dependencias vacías para ejecutarse solo cuando se enfoque
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mis Playlists</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#007bff" />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text> // Muestra un mensaje de error si no se pudieron cargar las playlists
            ) : (
                <PlaylistGrid playlists={playlists} showUser={false} />
            )}
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
});

export default UserPlaylistsScreen;
