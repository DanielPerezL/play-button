import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from "react-native";
import { createSuggestion } from "../services/apiService"; // asegurate que el path sea correcto

const SugerenciasScreen = () => {
    const [artistName, setArtistName] = useState("");
    const [songName, setSongName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!artistName.trim() || !songName.trim()) {
            Alert.alert("Por favor completa ambos campos.");
            return;
        }

        setLoading(true);
        const success = await createSuggestion(songName, artistName);
        setLoading(false);

        if (success) {
            Alert.alert(
                "Sugerencia enviada",
                "Hemos recibido tu sugerencia correctamente, pronto podrás encontrar esa canción en el sistema"
            );
            setArtistName("");
            setSongName("");
        } else {
            Alert.alert(
                "Error inesperado",
                "Hubo un error al enviar la sugerencia"
            );
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sugerir canción</Text>

            <TextInput
                placeholder="Nombre del artista"
                value={artistName}
                onChangeText={setArtistName}
                style={styles.input}
                placeholderTextColor="#aaa"
            />

            <TextInput
                placeholder="Nombre de la canción"
                value={songName}
                onChangeText={setSongName}
                style={styles.input}
                placeholderTextColor="#aaa"
            />

            <TouchableOpacity
                style={[
                    styles.button,
                    (loading || !artistName.trim() || !songName.trim()) &&
                        styles.buttonDisabled, // Aplica el estilo deshabilitado
                ]}
                onPress={handleSubmit}
                disabled={loading || !artistName.trim() || !songName.trim()}
            >
                <Text
                    style={[
                        styles.buttonText,
                        (loading || !artistName.trim() || !songName.trim()) &&
                            styles.buttonTextDisabled, // Aplica el estilo de texto deshabilitado
                    ]}
                >
                    {loading ? "Enviando..." : "Enviar sugerencia"}
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
    button: {
        backgroundColor: "#007bff", // Color por defecto cuando está habilitado
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonDisabled: {
        backgroundColor: "#cccccc", // Color cuando está deshabilitado
    },
    buttonText: {
        color: "white", // Texto blanco por defecto
        fontWeight: "bold",
    },
    buttonTextDisabled: {
        color: "#888888", // Texto gris cuando el botón está deshabilitado
    },
});

export default SugerenciasScreen;
