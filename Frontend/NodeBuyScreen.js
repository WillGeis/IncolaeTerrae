import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";

export default function NodeBuyScreen({ x, y, row, col, onClose, onSelectCity, onSelectSettlement, playerNumber, serverUrl, guid }) {

    const sendMove = async (moveType, moveData) => {
        try {
            const url = `${serverUrl}/processMove?guid=${guid}&moveType=${moveType}&moveDataJson=${encodeURIComponent(JSON.stringify(moveData))}`;
            const res = await fetch(url);
            const json = await res.json();
            if (!json.success)  {
                console.warn("[PURCHASE] Server rejected:", json.error);
                Toast.show({
                    type: "error",
                    text1: json.error,
                    visibilityTime: 4000,
                });
            }
            else onClose();
        } catch (err) {
            console.error("[PURCHASE] Fetch error:", err);
        }
    };

    const handleSettlement = () => {
        sendMove(0, {
        PlayerID: playerNumber,
        XSettlement: col,
        YSettlement: row / 2,
        });
        onSelectSettlement?.();
    };

    const handleCity = () => {
        sendMove(1, {
        PlayerID: playerNumber,
        XCity: col,
        YCity: row / 2,
        });
        onSelectCity?.();
    };

    return (
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <View style={[styles.container, { left: x - 50, top: y - 50 }]}>
            <Pressable style={styles.optionRow} onPress={handleSettlement}>
            <View style={styles.circle} />
            <Text style={styles.optionText}>Settlement</Text>
            </Pressable>
            <View style={styles.divider} />
            <Pressable style={styles.optionRow} onPress={handleCity}>
            <View style={styles.circle} />
            <Text style={styles.optionText}>City</Text>
            </Pressable>
        </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        width: 180,
        height: 100,
        backgroundColor: "#972929",
        padding: 16,
        justifyContent: "space-evenly",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
    divider: {
        height: 2,
        backgroundColor: "#7a2020",
    },
});