import * as FileSystem from "expo-file-system"; // Importa expo-file-system
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { emitLoginStatusChange } from "../events/authEventEmitter";

const PRODUCTION = false;
const API_BASE_URL = PRODUCTION
    ? "https://master-stinkbug-slowly.ngrok-free.app/api"
    : "http://192.168.18.59:5000/api";

const access_token = async () => await AsyncStorage.getItem("access_token");
export const isLoggedIn = async () =>
    (await AsyncStorage.getItem("isLoggedIn")) === "true";

export const getLoggedUserId = async () => {
    const userId = await AsyncStorage.getItem("loggedUserId");
    return userId ? Number(userId) : NaN;
};
export const login = async (nickname, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nickname, password }),
        });

        if (!response.ok) {
            throw new Error("Login incorrecto");
        }

        const data = await response.json();
        await AsyncStorage.setItem("access_token", data.access_token);
        await AsyncStorage.setItem("isLoggedIn", "true");
        // Tambien se recibe data.is_admin (para poder actuar sobre todos los recursos)
        await AsyncStorage.setItem("loggedUserId", String(data.user_id));
        console.log(String(data.user_id));
        console.log(await getLoggedUserId());

        emitLoginStatusChange(true);
    } catch (error) {
        throw new Error("Login incorrecto");
    }
};

export const logout = async () => {
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("isLoggedIn");
    await AsyncStorage.removeItem("loggedUserId");

    emitLoginStatusChange(false);
    return true;
};

// Array de ids o '[]'
export const fetchSongsData = async () => {
    //DEV
    //return [{"id":1},{"id":2},{"id":3}];
    try {
        const response = await customFetch(`${API_BASE_URL}/songs`, {});
        const data = await response.json();
        if (data.songs && Array.isArray(data.songs)) {
            return data.songs;
        } else {
            console.error("Invalid song data format:", data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching song IDs:", error);
        return [];
    }
};

export const getPlaylistSongs = async (playlistId) => {
    try {
        const response = await customFetch(
            `${API_BASE_URL}/playlists/${playlistId}/songs`,
            { method: "GET" }
        );
        if (!response.ok) {
            console.error(
                `Error fetching playlist songs: HTTP ${response.status}`
            );
            return null;
        }
        const data = await response.json();
        if (data.songs && Array.isArray(data.songs)) {
            return data.songs;
        } else {
            console.error("Invalid song data format:", data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching playlist songs:", error);
        return null;
    }
};

// Detalles de cancion o null
export const fetchSongDetails = async (song) => {
    if (!song || !song.id) {
        console.error("Invalid song object:", song);
        return null;
    }

    try {
        const response = await customFetch(
            `${API_BASE_URL}/songs/${song.id}`,
            {}
        );
        if (!response.ok) {
            console.error(
                `Error fetching song ${song.id} details: HTTP ${response.status}`
            );
            return null;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching song ${song.id} details:`, error);
        return null;
    }
};

// LocalUri del fichero o null
export const downloadAudio = async (url) => {
    //DEV
    //return FileSystem.cacheDirectory + 'audio.mp3';

    if (PRODUCTION && url.startsWith("http://")) {
        url = "https://" + url.slice(7); // Quitar 'http://' y agregar 'https://'
    }

    if (Platform.OS === "web") {
        try {
            const response = await customFetch(url);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            return objectUrl; // Devuelve la URL del blob
        } catch (error) {
            console.error("Error downloading audio file for web:", error);
            return null;
        }
    } else {
        const fileUri = FileSystem.cacheDirectory + "audio.mp3"; // Ruta temporal
        const headers = { Authorization: `Bearer ${await access_token()}` };
        const options = { headers };

        try {
            const { uri } = await FileSystem.downloadAsync(
                url,
                fileUri,
                options
            );
            return uri; // Devuelve la URI del archivo descargado
        } catch (error) {
            console.error("Error downloading audio file for mobile:", error);
            return null;
        }
    }
};

export const fetchUserPlaylists = async (userId) => {
    try {
        const response = await customFetch(
            `${API_BASE_URL}/users/${userId}/playlists`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            console.error(`Error fetching playlists: HTTP ${response.status}`);
            return [];
        }
        const data = await response.json();
        return data.playlists || []; // Devuelve las playlists
    } catch (error) {
        console.error("Error fetching playlists:", error);
        return [];
    }
};

export const getAllPlaylists = async (offset = 0, limit = 2) => {
    try {
        const response = await customFetch(
            `${API_BASE_URL}/playlists?offset=${offset}&limit=${limit}`,
            { method: "GET" }
        );
        if (!response.ok) {
            console.error(`Error fetching playlists: HTTP ${response.status}`);
            return null;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching playlists:", error);
        return null;
    }
};

export const createPlaylist = async (userId, name, isPublic = true) => {
    const data = { name, is_public: isPublic };
    try {
        const response = await customFetch(
            `${API_BASE_URL}/users/${userId}/playlists`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        if (!response.ok) {
            console.error(`Error creating playlist: HTTP ${response.status}`);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error creating playlist:", error);
        return false; // En caso de error, devuelve false
    }
};

export const deletePlaylist = async (playlistId) => {
    try {
        const response = await customFetch(
            `${API_BASE_URL}/playlists/${playlistId}`,
            { method: "DELETE" }
        );
        if (!response.ok) {
            console.error(`Error deleting playlist: HTTP ${response.status}`);
            return false;
        }
        return true;
    } catch (error) {
        console.error(`Error deleting playlist:`, error);
        return false;
    }
};

export const updatePlaylist = async (playlistId, newName, isPublic) => {
    try {
        const response = await customFetch(
            `${API_BASE_URL}/playlists/${playlistId}`,
            {
                method: "PUT",
                body: JSON.stringify({ name: newName, is_public: isPublic }),
            }
        );
        if (!response.ok) {
            console.error(`Error updating playlist: HTTP ${response.status}`);
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error updating playlist:", error);
        return false;
    }
};

export const addSongToPlaylist = async (playlistId, songId) => {
    try {
        const response = await customFetch(
            `${API_BASE_URL}/playlists/${playlistId}/songs/${songId}`,
            { method: "POST" }
        );
        if (!response.ok) {
            console.error(
                `Error adding song to playlist: HTTP ${response.status}`
            );
            return false;
        }
        return true;
    } catch (error) {
        console.error(`Error adding song to playlist:`, error);
        return false;
    }
};

export const removeSongFromPlaylist = async (playlistId, songId) => {
    try {
        const response = await customFetch(
            `${API_BASE_URL}/playlists/${playlistId}/songs/${songId}`,
            { method: "DELETE" }
        );
        if (!response.ok) {
            console.error(
                `Error removing song from playlist: HTTP ${response.status}`
            );
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error removing song from playlist:", error);
        return false;
    }
};

//Crear sugerencias
export const createSuggestion = async (songName, artistName) => {
    if (!songName || !artistName) {
        console.error("Invalid song or artist name:", songName, artistName);
        return false;
    }

    const fullName = `${artistName} - ${songName}`;

    try {
        const response = await customFetch(`${API_BASE_URL}/suggestions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ song_name: fullName }),
        });

        if (!response.ok) {
            console.error(
                `Error suggesting song "${fullName}": HTTP ${response.status}`
            );
            return false;
        }
        return true;
    } catch (error) {
        console.error(`Error suggesting song "${fullName}":`, error);
        return false;
    }
};

// Custom fetch para manejar errores de token JWT
export const customFetch = async (url, options = {}) => {
    if (!isLoggedIn()) {
        return [];
    }
    try {
        options.headers = {
            ...options.headers,
            Authorization: `Bearer ${await access_token()}`,
        };
        const response = await fetch(url, options);
        if (!response.ok) {
            if (response.status === 401) {
                logout();
                Alert.alert(
                    "Sesión Expirada",
                    "Tu sesión ha expirado. Por favor inicia sesión nuevamente."
                );
                return;
            }
        }
        return response;
    } catch (error) {
        console.error("Error en customFetch:", error);
        Alert.alert(
            "Error de Conexión",
            "Hubo un problema al conectar con el servidor. Inténtalo nuevamente."
        );
    }
};
