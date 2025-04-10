import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AccessMenu from "../components/AccessMenu";
import { isLoggedIn } from "../services/apiService";
import { StatusBar } from "expo-status-bar";

const AuthWrapper = ({ children, onLoginSuccess, logged }) => {
    const checkLogin = async () => {
        const result = await isLoggedIn();
        setLoggedIn(result);
    };

    useEffect(() => {
        checkLogin();
    }, []);

    if (!logged) {
        return (
            <View style={{ flex: 1, backgroundColor: "#222" }}>
                <StatusBar style="light" backgroundColor="#222" />
                <AccessMenu onLoginSuccess={onLoginSuccess} />
            </View>
        );
    }

    return <View style={{ flex: 1 }}>{children}</View>;
};

export default AuthWrapper;
