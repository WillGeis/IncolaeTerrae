import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { usePlayer } from "./PlayerContext";

export default function HUDControls({isPlayerTurn}) {
  const { playerNumber, guid, serverUrl } = usePlayer();
  
  const handleEndTurn = async () => {
    if (!isPlayerTurn || !serverUrl) return;

    try {
      const moveData = JSON.stringify({ PlayerID: playerNumber });
      const url = `${serverUrl}/processMove?guid=${guid}&moveType=5&moveDataJson=${encodeURIComponent(moveData)}`;
      
      const res = await fetch(url);
      const json = await res.json();

      if (!json.success) {
        console.warn("[END TURN] Server rejected:", json.error);
      }
    } catch (err) {
      console.error("[END TURN] Fetch error:", err);
    }
  };

  return (
    <View style={styles.hud} pointerEvents="box-none">
      <TouchableOpacity
        style={[styles.endTurnButton, !isPlayerTurn && styles.endTurnDisabled]}
        onPress={handleEndTurn}
        disabled={!isPlayerTurn}
        activeOpacity={0.75}
      >
        <Text style={styles.endTurnText}>
          {isPlayerTurn ? "End Turn ▶" : "Waiting..."}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: [{ translateY: -30 }],
    zIndex: 20,
  },
  button: {
    backgroundColor: "#972929",
    padding: 10,
    borderRadius: 0,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#4a1a1a",
  },
  buttonPressed: {
    backgroundColor: "#7a2020",
  },
  buttonText: {
    fontWeight: "bold",
    fontFamily: "Jersey10",
    color: "#ffd000",
    fontSize: 36,
    textAlign: "center",
  },
  buttonTextDisabled: {
    color: "#7a6000",
  },
});