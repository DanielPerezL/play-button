// navigation/UserPlaylistsStack.js

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserPlaylistsScreen from "../screens/UserPlaylistsScreen";
import NewPlaylistScreen from "../screens/NewPlaylistScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderMenuButton from "../components/HeaderMenuButton";

const Stack = createNativeStackNavigator();

const UserPlaylistsStack = () => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: "#333" },
                    headerTintColor: "#fff",
                    headerLeft: () => <HeaderMenuButton />, // Asegúrate de que esto esté aquí
                }}
            >
                <Stack.Screen
                    name="UserPlaylists"
                    component={UserPlaylistsScreen}
                    options={{ title: "Mis playlists" }}
                />
                <Stack.Screen
                    name="NewPlaylistScreen"
                    component={NewPlaylistScreen}
                    options={{ title: "Nueva Playlist" }}
                />
            </Stack.Navigator>
        </SafeAreaView>
    );
};

export default UserPlaylistsStack;
