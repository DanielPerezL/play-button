import React from "react";
import { Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";

const PlaylistGrid = ({ playlists, showUser }) => {
    const renderPlaylistItem = ({ item }) => (
        <TouchableOpacity
            style={styles.playlistItem}
            onPress={() => console.log("Accediendo a la playlist:", item.id)}
        >
            {/* Si tienes imágenes de miniatura, puedes descomentar la línea siguiente */}
            {/* <Image source={{ uri: item.thumbnail }} style={styles.playlistImage} /> */}
            <Text style={styles.playlistName}>{item.name}</Text>
            {showUser && (
                <Text style={styles.userName}>Creada por: {item.user}</Text>
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
        height: 100, // Altura suficiente para mostrar la información
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
    contentContainer: {
        paddingBottom: 20, // Espacio adicional al final del contenido
    },
});

export default PlaylistGrid;
