import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function RoadBuyScreen({ x, y, hexIndex, edgeIndex, onClose, onSelectRoad, playerNumber, serverUrl, guid }) {

    const sendMove = async (moveType, moveData) => {
        try {
            const url = `${serverUrl}/processMove?guid=${guid}&moveType=${moveType}&moveDataJson=${encodeURIComponent(JSON.stringify(moveData))}`;
            const res = await fetch(url);
            const json = await res.json();
            if (!json.success) console.warn("[PURCHASE] Server rejected:", json.error);
            else onClose();
        } catch (err) {
            console.error("[PURCHASE] Fetch error:", err);
        }
    };

    const handleRoad = () => {
        sendMove(2, {
            PlayerID: playerNumber,
            HexNumber: hexIndex,
            HexSide: edgeIndex,
            RoadBuildingCard: false,
        });
        onSelectRoad?.();
    };

    return (
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
            <View style={[styles.container, { left: x - 50, top: y - 50 }]}>
                <Pressable style={styles.optionRow} onPress={handleRoad}>
                    <View style={styles.circle} />
                    <Text style={styles.optionText}>Road</Text>
                </Pressable>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        width: 180,
        height: 60,
        backgroundColor: "#972929",
        padding: 16,
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    circle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "#7a2020",
        borderWidth: 2,
        borderColor: "#ffd000",
    },
    optionText: {
        fontFamily: "Jersey10",
        color: "#ffd000",
        fontSize: 28,
    },
});