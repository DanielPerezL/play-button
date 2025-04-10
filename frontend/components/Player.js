import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import Slider from "@react-native-community/slider";
import TrackPlayer, {
    State,
    Capability,
    useProgress,
    usePlaybackState,
    Event,
    AppKilledPlaybackBehavior,
    useTrackPlayerEvents,
} from "react-native-track-player";
import { downloadAudio, fetchSongDetails } from "../services/apiService";
import { StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { cleanCache, formatTime } from "../services/utils";

const Player = ({ songs, onSongsEnd }) => {
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [currentSong, setCurrentSong] = useState(null);
    const [isQueueVisible, setIsQueueVisible] = useState(false); // State to toggle queue visibility
    const playbackState = usePlaybackState();
    const progress = useProgress();

    useEffect(() => {
        const setupPlayer = async () => {
            await TrackPlayer.setupPlayer();
            TrackPlayer.updateOptions({
                android: {
                    appKilledPlaybackBehavior:
                        AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
                },
                capabilities: [
                    Capability.Play,
                    Capability.Pause,
                    Capability.SkipToNext,
                    Capability.SkipToPrevious,
                ],
                compactCapabilities: [
                    Capability.Play,
                    Capability.Pause,
                    Capability.SkipToNext,
                    Capability.SkipToPrevious,
                ],
                notificationCapabilities: [
                    Capability.Play,
                    Capability.Pause,
                    Capability.SkipToNext,
                    Capability.SkipToPrevious,
                ],
            });

            const onPlay = TrackPlayer.addEventListener(
                Event.RemotePlay,
                async () => {
                    await TrackPlayer.play();
                }
            );

            const onPause = TrackPlayer.addEventListener(
                Event.RemotePause,
                async () => {
                    await TrackPlayer.pause();
                }
            );

            return () => {
                onPlay.remove();
                onPause.remove();
            };
        };

        setupPlayer();
    }, []);

    useEffect(() => {
        const onNext = TrackPlayer.addEventListener(
            Event.RemoteNext,
            async () => {
                setCurrentSongIndex((prev) => prev + 1);
            }
        );

        const onPrevious = TrackPlayer.addEventListener(
            Event.RemotePrevious,
            async () => {
                setCurrentSongIndex((prev) => prev - 1);
            }
        );

        return () => {
            onNext.remove();
            onPrevious.remove();
        };
    }, [songs]);

    const playMusic = async () => {
        if (songs && songs.length > 0 && currentSongIndex !== null) {
            const preparedSong = await prepareSong(songs[currentSongIndex]);
            playSong(preparedSong);
        }
    };

    useEffect(() => {
        const prepareTrackPlayer = async () => {
            await TrackPlayer.stop();
            await cleanCache();
        };
        prepareTrackPlayer();
        if (songs && songs.length > 0) {
            playMusic();
        }
    }, [songs]);

    useEffect(() => {
        const songsEnded = async () => {
            await TrackPlayer.removeUpcomingTracks();
            onSongsEnd();
            setCurrentSongIndex(0);
        };

        if (currentSongIndex < 0) {
            setCurrentSongIndex(0);
            return;
        }

        if (songs && currentSongIndex >= songs.length) {
            songsEnded();
        } else {
            playMusic();
        }
    }, [currentSongIndex]);

    const prepareSong = async (songId) => {
        const fetchedSong = await fetchSongDetails(songId);
        setCurrentSong(fetchedSong);
        return fetchedSong;
    };

    const playSong = async (preparedSong) => {
        const { id, name, mp3_url } = preparedSong;
        const localUri = await downloadAudio(mp3_url);
        if (!localUri) return;

        await TrackPlayer.reset();
        await TrackPlayer.add([
            {
                id: "prev",
                url: localUri,
                title: "Cancion anterior",
                artist: "",
            },
            { id, url: localUri, title: name, artist: "" },
            {
                id: "next",
                url: localUri,
                title: "Siguiente cancion",
                artist: "",
            },
        ]);
        await TrackPlayer.skipToNext();
        await TrackPlayer.play();
    };

    const togglePlayPause = async () => {
        if (playbackState.state === State.Playing) {
            await TrackPlayer.pause();
        } else {
            await TrackPlayer.play();
        }
    };

    const playNext = () => {
        setCurrentSongIndex((prev) => prev + 1);
    };

    const playPrev = () => {
        setCurrentSongIndex((prev) => prev - 1);
    };

    const seek = async (value) => {
        await TrackPlayer.seekTo(value);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={togglePlayPause}>
                <FontAwesome
                    name={
                        playbackState.state === State.Playing ? "pause" : "play"
                    }
                    size={30}
                    color="white"
                />
            </TouchableOpacity>
            <Text style={styles.song}>
                {currentSong?.name || "Cargando..."}
            </Text>
            <View style={styles.sliderContainer}>
                <Text style={styles.time}>{formatTime(progress.position)}</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={progress.duration || 1}
                    value={progress.position}
                    onSlidingComplete={seek}
                />
                <Text style={styles.time}>{formatTime(progress.duration)}</Text>
            </View>

            <TouchableOpacity style={styles.previousButton} onPress={playPrev}>
                <FontAwesome name="step-backward" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={playNext}>
                <FontAwesome name="step-forward" size={30} color="white" />
            </TouchableOpacity>

            {/* Button to toggle queue visibility */}
            <TouchableOpacity
                style={styles.queueButton}
                onPress={() => setIsQueueVisible(!isQueueVisible)}
            >
                <Text style={styles.queueButtonText}>Ver Cola</Text>
            </TouchableOpacity>

            {/* Queue display */}
            {isQueueVisible && (
                <FlatList
                    data={songs}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index }) => (
                        <View style={styles.queueItem}>
                            <Text style={styles.queueItemText}>
                                {item.name}
                            </Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#222",
    },
    button: {
        padding: 20,
        height: 70,
        width: 70,
        backgroundColor: "#444",
        borderRadius: 35,
        marginBottom: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    song: {
        color: "white",
        fontSize: 18,
        marginBottom: 20,
    },
    sliderContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "80%",
    },
    slider: {
        flex: 1,
        marginHorizontal: 10,
    },
    time: {
        color: "white",
        fontSize: 14,
    },
    previousButton: {
        position: "absolute",
        bottom: 50,
        left: 30,
    },
    nextButton: {
        position: "absolute",
        bottom: 50,
        right: 30,
    },
    queueButton: {
        marginTop: 20,
        backgroundColor: "#444",
        padding: 10,
        borderRadius: 6,
        marginBottom: 15,
    },
    queueButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    queueItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    queueItemText: {
        color: "white",
        marginRight: 10,
    },
    reorderButton: {
        color: "white",
        fontSize: 16,
        marginHorizontal: 5,
    },
});

export default Player;
