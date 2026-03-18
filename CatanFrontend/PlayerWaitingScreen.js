import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { usePlayer } from "./PlayerContext";
import useGameHub from "./useGameHub";

const API_BASE = "http://localhost:5082";

export default function PlayerWaitingScreen({ route, navigation }) {
  const { guid, isHost } = usePlayer();
  const [serverIP, setServerIP] = useState("Loading...............");
  const [players, setPlayers] = useState([]);

  const serverUrl = route.params?.serverIP ?? API_BASE;
  const playerGUID = route.params?.playerGUID ?? guid;

  const startingRef = useRef(false);

  console.log("[DEBUG] PlayerWaitingScreen render | isHost =", isHost);

  const { connected } = useGameHub(
    serverUrl,
    playerGUID,
    (gameState) => {
      navigation.replace("Game", { gameState, serverIP: serverUrl });
    },
    async () => {
      try {
        const res = await fetch(`${serverUrl}/players`);
        const data = await res.json();
        setPlayers(data);
      } catch (err) {
        console.error("[ERROR] fetch players failed:", err);
      }
    }
  );

  useEffect(() => {
    let isMounted = true;

    const fetchServerIP = async () => {
      console.log("[DEBUG] Fetching server-info...");
      try {
        const res = await fetch(`${API_BASE}/server-info`);
        const data = await res.json();

        console.log("[DEBUG] /server_info response:", data);

        if (isMounted) {
          if (data.ready && data.serverIP) {
            setServerIP(data.serverIP);
          } else {
            setTimeout(fetchServerIP, 2000); // 2 second polling
          }
        }
      } catch (err) {
        console.error("[ERROR] /server_info failed:", err);
        if (isMounted) {
          setServerIP("[ERROR] retrying server connection...");
          setTimeout(fetchServerIP, 2000);
        }
      }
    };

    const fetchPlayers = async () => {
      try {
        const res = await fetch(`${API_BASE}/players`);
        const data = await res.json();
        if (isMounted) setPlayers(data);
      } catch (err) {
        console.error("[ERROR] fetch players failed:", err);
      }
    };

    fetchServerIP();
    fetchPlayers();

    return () => {
      isMounted = false;
    };
  }, []);

  const copyToClipboard = () => {
    console.log("[DEBUG] Copy IP:", serverIP);
    try {
      navigator.clipboard.writeText(serverIP);
      Alert.alert("Copied to clipboard!", serverIP);
    } catch {
      Alert.alert("Clipboard not supported...");
    }
  };

  const handleStartGame = async () => {
    console.log("[DEBUG] Go button pressed!");
    console.log("[DEBUG] Host GUID:", guid);

    if (startingRef.current) return;
    startingRef.current = true;

    try {
      const res = await fetch(`${API_BASE}/startGame`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ }),
      });

      console.log("[DEBUG] startGame HTTP status:", res.status);

      const data = await res.json();
      console.log("[DEBUG] startGame response:", data);

      if (!data.success) {
        Alert.alert("[ERROR] Failed to start game", data.message || "[ERROR] Unknown error");
      }

      navigation.replace("Loading");
    } catch (err) {
      console.error("[ERROR] startGame request failed:", err);
      Alert.alert("[ERROR] Failed to start game");
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.hubStatus}>
        <View style={[styles.hubDot, { backgroundColor: connected ? "#00ff99" : "#e24b25" }]} />
        <Text style={styles.hubText}>{connected ? "Live" : "Connecting..."}</Text>
      </View>

      <Text style={styles.title}>Players Connected:</Text>

      <View style={styles.playerList}>
        {players.map((p, i) => (
          <Text key={p.guid} style={styles.player}>
            Player {i + 1}: {p.username}
            {i === 0 ? " (Host)" : ""}
          </Text>
        ))}
      </View>

      <Text style={styles.status}>
        {players.length < 2 ? "Waiting for more players..." : "Ready to start!"}
      </Text>

      {isHost && (
        <Pressable
          onPress={handleStartGame}
          style={[styles.startButton, !connected && styles.startButtonDisabled]}
          disabled={!connected}
        >
          <Text style={styles.buttonText}>Go</Text>
        </Pressable>
      )}

      <Pressable style={styles.ipBox} onPress={copyToClipboard}>
        <Text style={styles.ipText}>{serverIP}</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#090d18", padding: 40 },
  title: { fontSize: 20, color: "#e0e7ff", marginBottom: 20, textAlign: "center", fontFamily: "Jersey10" },
  playerList: { marginTop: 20 },
  player: { fontSize: 40, color: "#00ff99", marginBottom: 10, fontFamily: "Jersey10" },
  status: { marginTop: 40, color: "#aaa", textAlign: "center", fontFamily: "Jersey10", fontSize: 30 },
  startButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 30,
    alignSelf: "center",
    backgroundColor: "lime",
  },
  buttonText: { color: "#000", fontSize: 40, fontWeight: "bold", fontFamily: "Jersey10" },
  ipBox: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#1e1e2f",
    fontFamily: "Jersey10",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#00ff99",
  },
  ipText: { color: "#00ff99", fontWeight: "bold", fontFamily: "Jersey10", fontSize: 30 },
  hubStatus: {
    position: "absolute",
    top: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hubDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  hubText: { color: "#94a3b8", fontFamily: "Jersey10", fontSize: 16 },
});