import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { usePlayer } from "./PlayerContext";

const SERVER_URL = "your-server-url-here";

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
          {isPlayerTurn ? "End Turn" : "Waiting..."}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    position: "absolute",
    bottom: 32,
    right: 24,
    zIndex: 20,
  },
  endTurnButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  endTurnDisabled: {
    backgroundColor: "#334155",
  },
  endTurnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});