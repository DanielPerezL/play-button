import React, { useState, useEffect } from "react";
import { View } from "react-native";
import Player from "../components/Player";

const PlayerScreen = ({ songs, handleSongsEnd }) => {
    return (
        <View style={{ flex: 1, backgroundColor: "#222" }}>
            <Player songs={songs} onSongsEnd={handleSongsEnd} />
        </View>
    );
};

export default PlayerScreen;
