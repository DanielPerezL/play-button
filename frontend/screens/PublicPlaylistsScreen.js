import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Button,
} from "react-native";
import PlaylistGrid from "../components/PlaylistGrid"; // Importa el componente PlaylistGrid
import { getAllPlaylists } from "../services/apiService"; // Asegúrate de tener una función que obtenga las playlists públicas
import { useFocusEffect } from "@react-navigation/native";

const PublicPlaylistsScreen = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Para manejar errores
    const [offset, setOffset] = useState(0); // Offset para la paginación
    const [hasMore, setHasMore] = useState(false); // Para saber si hay más playlists
    const [loadingMore, setLoadingMore] = useState(false); // Para gestionar la carga de más playlists

    const getPlaylists = async () => {
        setLoading(true);
        try {
            const playlistsData = await getAllPlaylists(offset); // Llama al servicio para obtener las playlists públicas con el offset
            console.log("Public Playlists Data:", playlistsData); // Verifica que las playlists sean correctas

            if (playlistsData.playlists.length === 0 && offset === 0) {
                setError("No public playlists found"); // Si no hay playlists públicas, mostrar mensaje de error
            }

            // Filtra duplicados si se reciben las mismas playlists
            setPlaylists((prevPlaylists) => {
                const newPlaylists = playlistsData.playlists.filter(
                    (newPlaylist) =>
                        !prevPlaylists.some(
                            (prevPlaylist) => prevPlaylist.id === newPlaylist.id
                        )
                );
                return [...prevPlaylists, ...newPlaylists];
            });

            setHasMore(playlistsData.has_more); // Si hay más playlists, ajustamos hasMore

            setOffset(
                (prevOffset) => prevOffset + playlistsData.playlists.length
            ); // Actualizamos el offset con la cantidad de playlists que ya cargamos
        } catch (err) {
            console.error("Error fetching public playlists:", err);
            setError("Error fetching public playlists");
        } finally {
            setLoading(false); // Cambia el estado de carga
            setLoadingMore(false); // Restablece la bandera de carga al cargar más
        }
    };

    // Usamos useEffect para cargar las playlists iniciales al montar la pantalla
    useEffect(() => {
        getPlaylists(); // Llamamos a la función al cargar la pantalla
    }, []);

    // Cuando el usuario regresa a la pantalla, recargamos las playlists
    useFocusEffect(
        useCallback(() => {
            setPlaylists([]); // Limpiamos las playlists para recargar
            setOffset(0); // Restablecemos el offset
            setHasMore(false); // Reiniciamos hasMore
            getPlaylists(); // Llamamos nuevamente a la función
        }, []) // Dependencias vacías para ejecutarse solo cuando se enfoque
    );

    // Función para cargar más playlists cuando el usuario hace clic en "Cargar más"
    const loadMorePlaylists = () => {
        if (hasMore && !loadingMore) {
            setLoadingMore(true);
            getPlaylists();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Playlists públicas</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#007bff" />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text> // Muestra un mensaje de error si no se pudieron cargar las playlists
            ) : (
                <>
                    <PlaylistGrid playlists={playlists} showUser={true} />
                    {hasMore && (
                        <Button
                            title={loadingMore ? "Cargando..." : "Cargar más"}
                            onPress={loadMorePlaylists}
                            color="#007bff"
                            disabled={loadingMore} // Deshabilitamos el botón mientras se cargan más playlists
                        />
                    )}
                </>
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

export default PublicPlaylistsScreen;
