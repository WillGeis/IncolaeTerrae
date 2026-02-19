import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { usePlayer } from "./PlayerContext";

export default function PlayerWaitingScreen() {
  const { guid, isHost } = usePlayer();
  const [serverIP, setServerIP] = useState("Loading...............");
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchServerIP = async () => {
      try {
        let retries = 0;

        while (retries < 30) {
          const res = await fetch("http://localhost:5082/server-info");
          if (!res.ok) throw new Error("Failed to fetch server info");
          const data = await res.json();

          if (data.ready && data.serverIP) {
            if (isMounted) setServerIP(data.serverIP);
            break;
          }

          retries++;
          await new Promise(res => setTimeout(res, 500));
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setServerIP("Error fetching server URL");
      }
    };

    const fetchPlayers = async () => {
      try {
        const res = await fetch("http://localhost:5082/players");
        if (!res.ok) throw new Error("Failed to fetch players");
        const text = await res.text();
        const data = text ? JSON.parse(text) : [];
        if (isMounted) setPlayers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchServerIP();
    const interval = setInterval(fetchPlayers, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(serverIP);
      Alert.alert("Copied to clipboard!", serverIP);
    } catch {
      Alert.alert("Clipboard not supported.");
    }
  };

  const startGame = async () => {
    try {
      await fetch("http://localhost:5082/start-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guid })
      });
      Alert.alert("Game started!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Players Connected:</Text>

      <View style={styles.playerList}>
        {players.map((p, i) => (
          <Text key={i} style={styles.player}>
            Player {i + 1}: {p.username} {p.guid === players[0].guid ? "(Host)" : ""}
          </Text>
        ))}
      </View>

      <Text style={styles.status}>
        Waiting for more players...
      </Text>

      {isHost && (
        <Pressable style={styles.startButton} onPress={startGame}>
          <Text style={styles.buttonText}>Start Game</Text>
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
  title: { fontSize: 28, color: "#e0e7ff", marginBottom: 20, textAlign: "center" },
  playerList: { marginTop: 20 },
  player: { fontSize: 18, color: "#00ff99", marginBottom: 10 },
  status: { marginTop: 40, color: "#aaa", textAlign: "center" },
  startButton: {
    backgroundColor: "#e24b25",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 30,
    alignSelf: "center",
  },
  buttonText: { color: "#000", fontSize: 20, fontWeight: "bold", textAlign: "center" },
  ipBox: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#1e1e2f",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#00ff99",
  },
  ipText: { color: "#00ff99", fontWeight: "bold" },
});
