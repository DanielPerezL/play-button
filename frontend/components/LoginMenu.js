import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";

const LoginMenu = ({ onSubmit }) => {
    const [nick, setNick] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            await onSubmit(nick, password);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setNick("");
            setPassword("");
        }
    };

    return (
        <View style={styles.form}>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Nombre de usuario</Text>
                <TextInput
                    style={styles.input}
                    value={nick}
                    onChangeText={setNick}
                    autoCapitalize="none"
                    keyboardType="nick-address"
                    autoComplete="nick"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                />
            </View>

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Iniciar Sesión</Text>
                )}
            </TouchableOpacity>

            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    form: {
        width: "100%",
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontWeight: "600",
        marginBottom: 4,
        color: "#fff", // nuevo
    },
    input: {
        borderWidth: 1,
        borderColor: "#555",
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#444",
        color: "#fff", // nuevo
    },
    button: {
        backgroundColor: "#007bff",
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: "center",
        marginTop: 12,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
    },
    error: {
        color: "#dc3545",
        marginTop: 12,
        textAlign: "center",
    },
});

export default LoginMenu;
