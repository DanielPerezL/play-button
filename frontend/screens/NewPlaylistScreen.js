import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Switch,
    Alert,
} from "react-native";
import { createPlaylist, getLoggedUserId } from "../services/apiService";
import { emitPlaylistCreatedEvent } from "../events/playlistCreatedEvent"; // Importa el evento

const NewPlaylistScreen = ({ navigation }) => {
    const [playlistName, setPlaylistName] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (loading) return;

        if (!playlistName.trim()) {
            Alert.alert(
                "Error",
                "Por favor, ingresa un nombre para la playlist."
            );
            return;
        }

        setLoading(true);

        try {
            const success = await createPlaylist(
                await getLoggedUserId(),
                playlistName,
                isPublic
            );
            if (success) {
                Alert.alert("Éxito", "Playlist creada con éxito");
                emitPlaylistCreatedEvent(); // Emitir el evento
                navigation.goBack(); // Volver a la pantalla anterior (UserPlaylistsScreen)
            } else {
                Alert.alert(
                    "Error",
                    "Hubo un error al crear la playlist. Intenta nuevamente."
                );
            }
        } catch (error) {
            console.error("Error creating playlist:", error);
            Alert.alert(
                "Error",
                "Hubo un error al crear la playlist. Intenta nuevamente."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Crear Nueva Playlist</Text>

            <TextInput
                style={styles.input}
                placeholder="Nombre de la Playlist"
                value={playlistName}
                onChangeText={setPlaylistName}
                autoCapitalize="words"
            />

            <View style={styles.switchContainer}>
                <Text style={styles.label}>¿Hacerla pública?</Text>
                <Switch
                    value={isPublic}
                    onValueChange={setIsPublic}
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isPublic ? "#007bff" : "#f4f3f4"}
                />
            </View>

            <TouchableOpacity
                style={[
                    styles.button,
                    !playlistName.trim() && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading || !playlistName.trim()}
            >
                <Text
                    style={[
                        styles.buttonText,
                        !playlistName.trim() && styles.buttonTextDisabled,
                    ]}
                >
                    {loading ? "Creando..." : "Crear Playlist"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#222",
        justifyContent: "center",
    },
    title: {
        fontSize: 24,
        color: "white",
        marginBottom: 20,
        textAlign: "center",
        fontWeight: "bold",
    },
    input: {
        backgroundColor: "#333",
        color: "white",
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    label: {
        color: "white",
        fontSize: 16,
        marginRight: 10,
    },
    button: {
        backgroundColor: "#007bff",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonDisabled: {
        backgroundColor: "#cccccc",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
    buttonTextDisabled: {
        color: "#888888",
    },
});

export default NewPlaylistScreen;
