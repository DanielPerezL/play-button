import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LoginMenu from "./LoginMenu";
import { login } from "../services/apiService";
import { Alert } from "react-native";

const AccessMenu = ({ onLoginSuccess }) => {
    const [showLogin, setShowLogin] = useState(true);

    const handleLoginSubmit = async (email, password) => {
        try {
            await login(email, password);
            onLoginSuccess();
        } catch (err) {
            throw new Error(err.message);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.menu}>
                <Text style={styles.title}>Iniciar Sesión</Text>

                <LoginMenu onSubmit={handleLoginSubmit} />

                <TouchableOpacity
                    onPress={() =>
                        Alert.alert(
                            "Mal rollo",
                            "Pues desinstala la aplicación"
                        )
                    }
                >
                    <Text style={styles.link}>¿No tienes cuenta?</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    menu: {
        width: "100%",
        maxWidth: 400,
        padding: 24,
        backgroundColor: "#333", // antes era "#fff"
        borderRadius: 12,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        textAlign: "center",
        marginBottom: 16,
        color: "#fff", // nuevo
    },
    link: {
        marginTop: 20,
        color: "#66ccff", // nuevo color más suave
        textAlign: "center",
    },
});

export default AccessMenu;
