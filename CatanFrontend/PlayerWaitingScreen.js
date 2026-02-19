import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { usePlayer } from "./PlayerContext";

export default function PlayerWaitingScreen() {
  const { guid, isHost } = usePlayer();
  const [serverIP, setServerIP] = useState("Loading...............");
  const [players, setPlayers] = useState([]);

  console.log("[DEBUG] PlayerWaitingScreen render | isHost =", isHost);

  useEffect(() => {
    let isMounted = true;

    const fetchServerIP = async () => {
      console.log("[DEBUG] Fetching server-info...");
      try {
        const res = await fetch("http://localhost:5082/server-info");
        const data = await res.json();

        console.log("[DEBUG] /server_info response:", data);

        if (isMounted && data.ready && data.serverIP) {
          setServerIP(data.serverIP);
        }
      } catch (err) {
        console.error("[ERROR] /server_info failed:", err);
        if (isMounted) setServerIP("Error!");
      }
    };

    const fetchPlayers = async () => {
      try {
        const res = await fetch("http://localhost:5082/players");
        const data = await res.json();
        if (isMounted) setPlayers(data);
      } catch (err) {
        console.error("[ERROR] fetch players failed:", err);
      }
    };

    fetchServerIP();
    fetchPlayers();

    const interval = setInterval(fetchPlayers, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
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

    try {
      const res = await fetch("http://localhost:5082/startGame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      console.log("[DEBUG] startGame HTTP status:", res.status);

      const data = await res.json();
      console.log("[DEBUG] startGame response:", data);

      if (data.success) {
        Alert.alert("Game Started!", data.message);
      } else {
        Alert.alert("Start failed", data.message ?? "Unknown error");
      }
    } catch (err) {
      console.error("[ERROR] startGame request failed:", err);
      Alert.alert("Failed to start game");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Players Connected:</Text>

      <View style={styles.playerList}>
        {players.map((p, i) => (
          <Text key={p.guid} style={styles.player}>
            Player {i + 1}: {p.username}
            {i === 0 ? " (Host)" : ""}
          </Text>
        ))}
      </View>

      <Text style={styles.status}>Waiting for more players...</Text>

      {isHost && (
        <Pressable
          onPress={handleStartGame}
          style={[
            styles.startButton,
            { backgroundColor: "lime" },
          ]}
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
});