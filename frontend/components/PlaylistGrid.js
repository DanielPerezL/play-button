import React from "react";
import { Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";

const PlaylistGrid = ({ playlists, showUser }) => {
    const renderPlaylistItem = ({ item }) => (
        <TouchableOpacity
            style={styles.playlistItem}
            onPress={() => console.log("Accediendo a la playlist:", item.id)}
        >
            <Text style={styles.playlistName}>{item.name}</Text>
            {showUser && (
                <Text style={styles.userName}>Creada por: {item.user}</Text>
            )}
            {!showUser && (
                <Text
                    style={[
                        styles.isPublic,
                        item.is_public ? styles.public : styles.private,
                    ]}
                >
                    {item.is_public ? "Pública" : "Privada"}
                </Text>
            )}
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={playlists}
            renderItem={renderPlaylistItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={1} // Usar una columna
            contentContainerStyle={styles.contentContainer}
        />
    );
};

const styles = StyleSheet.create({
    playlistItem: {
        backgroundColor: "#333",
        margin: 10,
        borderRadius: 8,
        padding: 15,
        flex: 1,
        alignItems: "center",
        height: 120, // Aumenté la altura para que haya más espacio
        justifyContent: "center",
    },
    playlistName: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    userName: {
        color: "#aaa",
        fontSize: 14,
        marginTop: 5,
        textAlign: "center",
    },
    isPublic: {
        marginTop: 10, // Espacio entre el texto de la playlist y el estado de visibilidad
        fontSize: 16,
        fontWeight: "bold",
    },
    public: {
        color: "#007bff", // Azul para las públicas
    },
    private: {
        color: "#ff6347", // Rojo para las privadas
    },
    contentContainer: {
        paddingBottom: 20, // Espacio adicional al final del contenido
    },
});

export default PlaylistGrid;
